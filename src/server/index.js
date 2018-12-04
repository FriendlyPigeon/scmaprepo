const fs = require('fs');
const fetch = require('node-fetch');
const jimp = require('jimp');
const express = require('express');
const session = require('express-session');
const steam = require('steam-login');
const { check, validationResult } = require('express-validator/check');
const bodyParser = require('body-parser');
const knex = require('./db/knex');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { Storage } = require('@google-cloud/storage');

const projectId = 'scmaprepo';

const storage = new Storage({
  projectId: projectId
})

const bucketName = 'scmaprepo-files'

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(fileUpload({
  limits: { fileSize: 200*1024*1024 },
}));

app.use(express.static('dist'));

app.use(session({
  secret: 'some secret',
  saveUninitialized: true,
  resave: false,
}));

if(process.env.NODE_ENV === 'production') {
  app.use(steam.middleware({
    realm: 'https://scmaprepo.appspot.com/',
    verify: 'https://scmaprepo.appspot.com/auth/steam/return',
    apiKey: process.env.STEAM_API_KEY
  }))
} else {
  app.use(steam.middleware({
    realm: 'http://localhost:3000/',
    verify: 'http://localhost:3000/auth/steam/return',
    apiKey: process.env.STEAM_API_KEY
  }))
}

function isLoggedIn(req, res, next) {
  if(req.user) {
    return next();
  }
  return res.status(403).json({ error: 'You must be logged in' })
}

function hasPermissionToModifyMap(req, res, next) {
  if(!req.user) {
    return res.status(403).json({ error: 'You must be logged in' })
  }

  // Store steam id's of all users who are allowed to modify
  // a map (admins, the uploader, and the mappers)
  let permittedModifiers = [];
  
  // Get admins
  knex('users')
  .select('users.steam_id')
  .where('is_admin', true)
  .then(users => {
    users.map(user => {
      permittedModifiers.push(user.steam_id);
    })

    // Get uploader
    knex('maps')
    .select('maps.uploader')
    .where('id', req.params.id)
    .first()
    .then(uploader => {
      permittedModifiers.push(uploader.uploader)

      // Get mappers
      knex('authors')
      .select('mappers.steam_id')
      .innerJoin('mappers', 'mappers.id', 'authors.mapper_id')
      .where('map_id', req.params.id)
      .then(authors => {
        authors.map(author => {
          permittedModifiers.push(author.steam_id)
        })

        if(permittedModifiers.includes(req.user.steamid)) {
          return next();
        } else {
          return res.status(403).json({ error: 'You do not have permission to do this action' });
        }
      })
    })
  })
}

function findUsername(username) {
  return knex.select('username')
    .from('users')
    .where('username', username)
    .first()
    .then(function(data) {
      if(!data) {
        return true;
      } else {
        return false;
      }
    })
}

function findEmail(email) {
  return knex.select('email')
    .from('users')
    .where('email', email)
    .first()
    .then(function(data) {
      if(!data) {
        return true;
      } else {
        return false;
      }
    })
}

app.post('/api/users/register', [
  check('username', 'Username is required').isLength(1),
  check('username', 'Username is taken').custom(username => findUsername(username)),
  check('email', 'Email is required').isLength(1),
  check('email', 'Email is not valid').isEmail(),
  check('email', 'Email is taken').custom(email => findEmail(email))
], (req, res) => {
  if(!req.user) {
    return res.status(403).json({ errors: [{ msg: 'You must login through steam before registering'}] });
  }

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // If logged in through steam
  if(req.user.steamid) {
    knex('users')
      .insert({
        username: req.body.username,
        email: req.body.email,
        steam_id: req.user.steamid,
      })
      .returning(['username', 'email'])
      .then(function(username, email) {
        return res.send({
          username: username,
          email: email,
        })
      }) 
  }
})

app.get('/api/users/heartbeat', function(req, res) {
  if(req.user && req.user.steamid) {
    res.send({
      authenticated: true,
      steamid: req.user.steamid,
    })
  } else {
    res.send({
      authenticated: false
    })
  }
})

app.get('/auth/steam', 
  steam.authenticate(),
  function(req, res) {
    res.redirect('/')
  }
)

app.get('/auth/steam/return',
  steam.verify(),
  function(req, res) {
    knex.select('steam_id')
      .from('users')
      .where('steam_id', req.user.steamid)
      .first()
      .then(function(steam_id) {
        // If account already exists
        if(steam_id) {
          res.redirect('/')
        } else {
          console.log('reached')
          res.redirect('/register')
        }
      })
  }
)

app.get('/api/users/logout', function(req, res) {
  if(req.user) {
    res.clearCookie('connect.sid')
    res.send()
  }
})

app.get('/api/maps', function(req, res) {
  knex.select('maps.id', 'maps.name', 'maps.created_at', knex.raw('avg(map_ratings.rating) as average_rating'))
    .from('maps')
    .leftJoin('map_ratings', 'maps.id', 'map_ratings.map_id')
    .groupBy('maps.id', 'maps.name', 'maps.created_at')
    .then(function(maps) {
      console.log(maps)
      res.send(maps);
    })
})

app.get('/api/map/:id', function(req, res) {
  const mapId = req.params.id;

  knex.select('maps.name', 'maps.description',
      knex.raw('array_agg(distinct mappers.name) as authors'),
      knex.raw('array_agg(distinct authors.mapper_id) as mapper_ids'),
      knex.raw('array_agg(distinct tags.name) as tags'),
      knex.raw('array_agg(distinct map_tags.tag_id) as tag_ids'))
    .from('maps')
    .leftJoin('authors', 'maps.id', 'authors.map_id')
    .leftJoin('mappers', 'authors.mapper_id', 'mappers.id')
    .leftJoin('map_tags', 'maps.id', 'map_tags.map_id')
    .leftJoin('tags', 'map_tags.tag_id', 'tags.id')
    .where('maps.id', mapId)
    .groupBy('maps.name', 'maps.description')
    .first()
    .then(function(map) {
      res.send(map);
    })
})

app.get('/api/mappers/dropdown', function(req, res) {
  knex.select('mappers.id as key', 'mappers.id as value', 'mappers.name as text')
    .from('mappers')
    .then(function(mappers) {
      res.send(mappers);
    })
})

app.get('/api/tags/dropdown', function(req, res) {
  knex.select('tags.id as key', 'tags.id as value', 'tags.name as text')
    .from('tags')
    .then(function(tags) {
      res.send(tags);
    })
})

app.get('/api/mappers', function(req, res) {
  knex.select('mappers.id', 'mappers.name')
    .from('mappers')
    .then(function(mappers) {
      res.send(mappers);
    })
})

app.post('/api/map', isLoggedIn, function(req, res) {
  knex('maps')
    .insert({
      name: req.body.name,
      description: req.body.description,
      uploader: req.user.steamid,
    })
    .returning('id')
    .then(function(mapId) {
      console.log(mapId)
      req.body.authors.map(author => {
        knex('authors')
          .insert({
            mapper_id: author,
            map_id: mapId[0],
          })
          .then(() => {

          })
      })
      req.body.tags.map(tag => {
        knex('map_tags')
          .insert({
            tag_id: tag,
            map_id: mapId[0],
          })
          .then(() => {

          })
      })
    })
    .then(function() {
      res.send({
        success: 'Map successfully submitted'
      })
    })
    .catch(function(error) {
      console.log(error)
      res.status(400).send({
        error: error
      })
    })
})

app.put('/api/map/:id', hasPermissionToModifyMap, function(req, res) {
  knex
    .update({
      name: req.body.name,
      description: req.body.description,
    })
    .into('maps')
    .where('maps.id', req.params.id)
    .then(() => {
      knex('authors')
      .select('authors.mapper_id')
      .where('authors.map_id', req.params.id)
      .then(function(current_authors_object) {
        const current_authors = current_authors_object.map(author =>
          author.mapper_id
        )
        req.body.authors && req.body.authors.map(author => {
          if(author !== null && current_authors.includes(author) === false) {
            knex('authors')
              .insert({
                mapper_id: author,
                map_id: req.params.id
              })
              // Why is this needed?
              .then(() => {

              })
          } 
        })
        current_authors && current_authors.map(author => {
          if(author !== null && req.body.authors.includes(author) === false) {
            knex('authors')
              .del()
              .where({
                mapper_id: author,
                map_id: req.params.id
              })
              .then(() => {
                
              })
          }
        })
      })
    })
    .then(() => {
      knex('map_tags')
        .select('map_tags.tag_id')
        .where('map_tags.map_id', req.params.id)
        .then(function(current_tags_object) {
          const current_tags = current_tags_object.map(tag =>
            tag.tag_id
          )
          req.body.tags && req.body.tags.map(tag => {
            if(tag !== null && current_tags.includes(tag) === false) {
              knex('map_tags')
                .insert({
                  tag_id: tag,
                  map_id: req.params.id
                })
                .then(() => {

                })
            }
          })
          current_tags && current_tags.map(tag => {
            if(tag !== null && req.body.tags.includes(tag) === false) {
              knex('map_tags')
                .del()
                .where({
                  tag_id: tag,
                  map_id: req.params.id
                })
                .then(() => {

                })
            }
          })
        })
    })
    .then(() => {
      res.send({
        success: 'Successfully updated map'
      })
    })
})

app.delete('/api/map/:id', hasPermissionToModifyMap, function(req, res) {
  storage.bucket(bucketName).deleteFiles({ prefix: `map/${req.params.id}` }, function(err, files) {
    if(err) {
      console.log(err)
    }
  })

  knex('maps')
    .delete()
    .where('id', req.params.id)
    .then(() => {
      console.log('reached')
      res.send({
        success: 'Successfully deleted map'
      })
    })
})

app.get('/api/map/:id/files', function(req, res) {
  storage.bucket(bucketName).getFiles({ prefix: `map/${req.params.id}/files` }, function(err, files) {
    if(err) {
      console.log(err)
    }

    const allFileUrls = []
    files.forEach(file => {
      allFileUrls.push(`https://storage.googleapis.com/scmaprepo-files/${file.metadata.name}`)
    })

    res.send({ fileUrls: allFileUrls });
  })
})

app.get('/api/map/:id/thumbnails', function(req, res) {
  storage.bucket(bucketName).getFiles({ prefix: `map/${req.params.id}/thumbnails` }, function(err, thumbnails) {
    if(err) {
      console.log(err)
    }
    
    const allThumbnailUrls = []
    thumbnails.forEach(thumbnail => {
      allThumbnailUrls.push(`https://storage.googleapis.com/scmaprepo-files/${thumbnail.metadata.name}`)
    })

    res.send({thumbnailUrls: allThumbnailUrls});
  })
})

app.get('/api/map/:id/screenshots', function(req, res) {
  storage.bucket(bucketName).getFiles({ prefix: `map/${req.params.id}/screenshots` }, function(err, screenshots) {
    if(err) {
      console.log(err)
    }
    
    const allScreenshotUrls = []
    screenshots.forEach(screenshot => {
      allScreenshotUrls.push(`https://storage.googleapis.com/scmaprepo-files/${screenshot.metadata.name}`)
    })

    res.send({screenshotUrls: allScreenshotUrls});
  })
})

app.post('/api/map/:id/files', isLoggedIn, function(req, res) {
  if(req.user === undefined) {
    return res.status(403).send({ error: 'You must be logged in to upload a file.' })
  } else if(['application/x-7z-compressed',
      'application/x-rar-compressed',
      'application/x-zip-compressed']
      .includes(req.files.file.mimetype) === false) 
    {
      return res.status(400).send({ error: 'Uploaded file must be of type 7Z, RAR, or ZIP' })
    } else if(req.files.file.truncated) {
      return res.status(400).send({ error: 'File exceeds 5MB limit' })
    } else {
      knex.select('maps.id')
        .from('maps')
        .where('maps.id', req.params.id)
        .first()
        .then(function(map) {
          if(map.id) {
            let uploadedFile = req.files.file
            let uploadedTime = Date.now().toString()
            let uploadedFileName = uploadedFile.name
            let uploadedFilePath = `${__dirname}/${uploadedFileName}`

            uploadedFile.mv(uploadedFilePath, function(err) {
              if(err) {
                return res.status(500).send(err);
              }
            })

            storage.bucket(bucketName).upload(uploadedFilePath, {
              destination: `/map/${map.id}/files/${uploadedFileName}`,
              metadata: {
                uploadedTime: uploadedTime,
                uploadedBy: req.user.steamid,
              },
              gzip: true,
            })
            .then(file => {
              fs.unlink(uploadedFilePath, (err) => {
                if(err) {
                  console.log(err)
                }
              })
  
              res.json({ 
                fileUrl: `https://storage.googleapis.com/scmaprepo-files/map/${map.id}/files/${uploadedFileName}`
              })
            })
            .catch(error => {
              console.log(error)
              fs.unlink(uploadedFilePath, (error) => {
                if(error) {
                  console.log(error);
                }
              })
            })
          }
        })
    }
})

app.delete('/api/map/:id/files/:fileName', hasPermissionToModifyMap, function(req, res) {
  storage
    .bucket(bucketName)
    .file(`map/${req.params.id}/files/${req.params.fileName}`).delete()
    .then(() => {
      return res.send({success: "Successfully deleted file"});
    })
    .catch(error => {
      console.log(error)

      return res.send({error: "There was an error deleting the file"})
    })
})

app.post('/api/map/:id/screenshots', isLoggedIn, function(req, res) {
  if(req.user === undefined) {
    return res.status(403).send({ error: 'You must be logged in to upload a screenshot.' })
  }
  // Only accept JPG or PNG images
  else if(['image/png', 'image/jpeg'].includes(req.files.file.mimetype) === false) {
    return res.status(400).send({ error: 'Uploaded file must be of type JPG or PNG' })
  } else if((req.files.file.data.length/(1024*1024)) > 5) {
    return res.status(400).send({ error: 'File exceeds 5MB limit' })
  } else {
    knex.select('maps.id')
    .from('maps')
    .where('maps.id', req.params.id)
    .first()
    .then(function(map) {
      if(map.id) {
        let imageFile = req.files.file
        let uploadedTime = Date.now().toString()
        let imageFileName = imageFile.name
        let imageFilePath = `${__dirname}/${imageFileName}`
        let thumbnailName = `${req.files.file.name}-thumbnail.jpg`
        let thumbnailPath = `${__dirname}/${thumbnailName}`


        imageFile.mv(imageFilePath, function(err) {
          if(err) {
            return res.status(500).send(err);
          }
        })

        jimp.read(imageFilePath, (err, image) => {
          if(err) {
            console.log(err)
          }

          image
            .resize(160, jimp.AUTO)
            .quality(60)
            .write(thumbnailPath)
        })

        // Upload raw image
        storage.bucket(bucketName).upload(imageFilePath, {
          destination: `/map/${map.id}/screenshots/${imageFileName}`,
          metadata: {
            uploadedTime: uploadedTime,
            uploadedBy: req.user.steamid,
          },
          gzip: true,
        })
        .then(file => {
          fs.unlink(imageFilePath, (err) => {
            if(err) {
              console.log(err)
            }
          })

          // Upload thumbnail
          storage.bucket(bucketName).upload(thumbnailPath, {
            destination: `/map/${map.id}/thumbnails/${thumbnailName}`,
            metadata: {
              uploadedTime: uploadedTime,
              uploadedBy: req.user.steamid,
            },
            gzip: true,
          })
          .then(file => {
            fs.unlink(thumbnailPath, (err) => {
              if(err) {
                console.log(err)
              }
            })

            res.json({ 
              thumbnailUrl: `https://storage.googleapis.com/scmaprepo-files/map/${map.id}/thumbnails/${thumbnailName}`,
              screenshotUrl: `https://storage.googleapis.com/scmaprepo-files/map/${map.id}/screenshots/${imageFileName}`,
            })
          })
        })
        .catch(error => {
          console.log(error)
          fs.unlink(imageFilePath, (error) => {
            if(error) {
              console.log(error);
            }
          })
          fs.unlink(thumbnailPath, (error) => {
            if(error) {
              console.log(error);
            }
          })
        })
      }
    }) 
  }
})

app.delete('/api/map/:id/screenshots/:screenshotName', hasPermissionToModifyMap, function(req, res) {
  storage
    .bucket(bucketName)
    .file(`map/${req.params.id}/screenshots/${req.params.screenshotName}`)
    .delete()
    .then(() => {
      storage
        .bucket(bucketName)
        .file(`map/${req.params.id}/thumbnails/${req.params.screenshotName}-thumbnail.jpg`)
        .delete()
        .then(() => {
          return res.send({success: "Successfully deleted file"})
        })
        .catch(error => {
          console.log(error)

          return res.send({error: "There was an error deleting the thumbnail"})
        })
    })
    .catch(error => {
      console.log(error)

      return res.send({error: "There was an error deleting the screenshot"})
    })
})

app.get('/api/map/:id/ratings', function(req, res) {
  knex('map_ratings')
    .avg('rating as averageRating')
    .where('map_ratings.map_id', req.params.id)
    .first()
    .then(averageRating => {
      if(averageRating.averageRating === null) {
        return res.send({ averageRating: 0 })
      } else {
        return res.send(averageRating)
      }
    })
})

app.post('/api/map/:id/rating', isLoggedIn, function(req, res) {
  if(isNaN(Number(req.body.rating))) {
    return res.status(400).send({ error: 'Rating must be a number from 1 to 10' })
  } else if(req.body.rating < 1 || req.body.rating > 10) {
    return res.status(400).send({ error: 'Rating must be a number from 1 to 10' })
  } else if(req.user === undefined) {
    return res.status(400).send({ error: 'You must be logged in to vote' })
  } else {
    // Check if map exists
    knex('maps')
      .select('id')
      .where('id', req.params.id)
      .then(function(id) {
        if(!id) {
          return res.status(400).send({ error: 'Map does not exist' })
        }
      })

    // Check if user has already voted
    knex('map_ratings')
      .select('map_ratings.steam_id')
      .where({
        steam_id: req.user.steamid,
        map_id: req.params.id,
      })
      .first()
      .then(function(steam_id) {
        // User already voted, update vote instead
        if(steam_id) {
          knex('map_ratings')
            .update('rating', req.body.rating)
            .where({
              steam_id: req.user.steamid,
              map_id: req.params.id
            })
            .returning('rating')
            .then(function(personalRating) {
              knex('map_ratings')
                .avg('rating as averageRating')
                .where('map_ratings.map_id', req.params.id)
                .first()
                .then(averageRating => {
                  if(averageRating.averageRating === null) {
                    return res.send({
                      personalRating: personalRating.personalRating,
                      averageRating: 0 
                    })
                  } else {
                    return res.send({
                      personalRating: personalRating.personalRating,
                      averageRating: averageRating.averageRating,
                    })
                  }
                })
            })
        }
        // User hasn't already voted, create new vote
        else {
          knex('map_ratings')
            .insert({
              rating: req.body.rating,
              steam_id: req.user.steamid,
              map_id: req.params.id
            })
            .returning('rating')
            .then(function(personalRating) {
              knex('map_ratings')
                .avg('rating as averageRating')
                .where('map_ratings.map_id', req.params.id)
                .first()
                .then(averageRating => {
                  if(averageRating.averageRating === null) {
                    return res.send({
                      personalRating: personalRating.personalRating,
                      averageRating: 0 
                    })
                  } else {
                    return res.send({
                      personalRating: personalRating.personalRating,
                      averageRating: averageRating.averageRating,
                    })
                  }
                })
            })
        }
      })
  }
})

function getComments(mapId) {
  return new Promise(function(resolve, reject) {
    knex.select('users.id as user_id', 'users.username', 'map_comments.comment', 'map_comments.id as comment_id', 'map_comments.reply_to_id')
      .from('map_comments')
      .leftOuterJoin('users', 'map_comments.steam_id', 'users.steam_id')
      .innerJoin('maps', 'map_comments.map_id', 'maps.id')
      .where('maps.id', mapId)
      .then(function(comments) {
        resolve(comments)
      })
  })
}

// Take a flat list of comments and nest replies under their parent
function formatToNestedComments(comments) {
  // Add replies field to each comment
  var nestedComments = comments.map(comment => {
    comment.replies = [];
    return comment;
  })

  nestedComments.map((replyComment, index) => {
    // If comment is a reply...
    if(replyComment.reply_to_id) {
      nestedComments.map(parentComment => {
        // ...then find its corresponding parent comment...
        if(parentComment.comment_id === replyComment.reply_to_id) {
          // ...and nest the reply comment under the parent
          parentComment.replies.push(replyComment);
        }
      })
    }
  })

  nestedComments = comments.filter(comment => {
    return comment.reply_to_id === null;
  })

  return nestedComments;
}

app.get('/api/map/:id/comments', function(req, res) {
  const mapId = req.params.id;

  getComments(mapId)
  .then(function(comments) {
    res.send(formatToNestedComments(comments))
  })
})

app.post('/api/map/:id/comments', isLoggedIn, function(req, res) {
  const replyToId = req.body.reply_to_id;

  // Make sure user is logged in
  if(req.user === undefined) {
    res.status(401).json({ error: 'You must be logged in to post a comment' });
    res.send();
  }

  // If comment is not a reply, check if map they are commenting on exists
  else if(replyToId === null) {
    knex.select('maps.id')
      .from('maps')
      .where('maps.id', req.params.id)
      .first()
      .then(function(map) {
        if(map.id) {
          knex('map_comments')
            .insert({
              comment: req.body.comment,
              steam_id: req.user.steamid,
              map_id: map.id,
              reply_to_id: null
            })
            .then(() =>
              getComments(map.id)
                .then(function(comments) {
                  res.send(formatToNestedComments(comments))
              })
            )
        } else {
          res.status(404).json({ error: 'Map not found' });
        }
      })
  }

  // If the comment is a reply, check for if the reply is to an existing comment and that the map exists
  else {
    knex.select('map_comments.id', 'map_comments.map_id')
    .from('map_comments')
    .where('map_comments.id', replyToId)
    .first()
    .then(function(comment) {
      // Take both new comments and replies
      if((comment.id || comment.id === null) && comment.map_id) {
        knex('map_comments')
        .insert({
          comment: req.body.comment,
          steam_id: req.user.steamid,
          map_id: comment.map_id,
          reply_to_id: req.body.reply_to_id,
        })
        .then(() =>
          getComments(comment.map_id)
            .then(function(comments) {
              res.send(formatToNestedComments(comments))
            })
        )
      } else {
        res.status(404).json({ error: 'The comment or map you replied to doesn\'t exist' });
      }
    })
  }
})

app.delete('/api/map/:id/comments', function(req, res) {
  // Make sure user is logged in
  if(req.session.userId === undefined) {
    res.status(401).json({ error: 'You must be logged in as this user to delete this comment' });
    res.send();
  } else {
    knex.select('map_comments.id', 'map_comments.steam_id')
    .from('map_comments')
    .where('map_comments.id', req.body.comment_id)
    .first()
    .then(function(comment) {
      if(comment.steam_id === req.user.steamid) {
        knex('map_comments')
          .where('map_comments.id', comment.id)
          .update({
            comment: '[deleted]',
            steam_id: null,
          })
          .then(function() {
            getComments(req.params.id)
            .then(function(comments) {
              res.send(formatToNestedComments(comments))
            })
          })
      }
    })
  }
})

app.get('/api/mappers', function(req, res) {
  knex.select()
    .from('mappers')
    .then(function(mappers) {
      res.send(mappers);
    })
})

app.get('/api/mapper/:id', function(req, res) {
  const mapperId = req.params.id;

  knex.select('mappers.name', 'mappers.steam_id', 
      knex.raw('array_agg(maps.name) as maps'),
      knex.raw('array_agg(maps.id) as map_ids'))
    .from('mappers')
    .innerJoin('authors', 'mappers.id', 'authors.mapper_id')
    .innerJoin('maps', 'maps.id', 'authors.map_id')
    .where('mappers.id', mapperId)
    .groupBy('mappers.name', 'mappers.steam_id')
    .first()
    .then(function(mapper) {
      if(mapper === undefined) {
        knex.select('mappers.name', 'mappers.steam_id')
          .from('mappers')
          .where('mappers.id', mapperId)
          .first()
          .then(function(mapper) {
            res.send(mapper);
          })
      } else {
        res.send(mapper);
      }
    })
})

app.post('/api/mapper', isLoggedIn, function(req, res) {
  if(req.body.name === '') {
    return res.status(400).send({ error: 'Name can not be blank' })
  }
  fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${req.body.vanityurl}`)
    .then(res => res.json())
    .then(json => {
      if(json.response.success = 1) {
        knex('mappers')
          .insert({
            name: req.body.name,
            steam_id: json.response.steamid,
          })
          .then(() => {
            return res.send({
              success: 'Successful mapper submit',
            })
          })
      } else {
        return res.status(400).send({ error: 'Invalid steam profile' })
      }
    })
})

app.put('/api/mapper/:id', isLoggedIn, function(req, res) {
  if(req.body.name === '') {
    return res.status(400).send({ error: 'Name can not be blank' })
  }

  knex('mappers')
    .update({
      name: req.body.name
    })
    .where('id', req.params.id)
    .then(() => {
      return res.send({
        success: 'Successful mapper update',
      })
    })
})

app.get('/api/tags', function(req, res) {
  knex('tags')
    .select('tags.id', 'tags.name')
    .then(tags => {
      res.send(tags)
    })
})

app.post('/api/tag', isLoggedIn, function(req, res) {
  if(req.body.name === '') {
    return res.status(400).send({ error: 'Name can not be blank' })
  }
  knex('tags')
    .insert({
      name: req.body.name,
    })
    .then(() => {
      return res.send({
        success: 'Successful tag submit'
      })
    })
})

app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../../dist/index.html'))
})

app.listen(process.env.PORT || 8080, () => console.log(`Server listening on port ${process.env.PORT || 8080}`))