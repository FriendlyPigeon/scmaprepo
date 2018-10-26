const fs = require('fs');
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
  limits: { fileSize: 5*1024*1024 },
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
    realm: 'http://localhost:8080/',
    verify: 'http://localhost:8080/auth/steam/return',
    apiKey: process.env.STEAM_API_KEY
  }))
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
    console.log(req.user)
    knex.select('steam_id')
      .from('users')
      .where('steam_id', req.user.steamid)
      .first()
      .then(function(steam_id) {
        // If account already exists
        if(steam_id) {
          res.redirect('/')
        } else {
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
  knex.select()
    .from('maps')
    .then(function(maps) {
      res.send(maps);
    })
})

app.get('/api/map/:id', function(req, res) {
  const mapId = req.params.id;

  knex.select('maps.name', 'maps.description',
      knex.raw('array_agg(mappers.name) as authors'),
      knex.raw('array_agg(authors.mapper_id) as mapper_ids'))
    .from('maps')
    .innerJoin('authors', 'maps.id', 'authors.map_id')
    .innerJoin('mappers', 'authors.mapper_id', 'mappers.id')
    .where('maps.id', mapId)
    .groupBy('maps.name', 'maps.description')
    .first()
    .then(function(map) {
      // If there are no authors of a map, just return the map name
      if(map === undefined) {
        knex.select('maps.name', 'maps.description').from('maps').where('maps.id', mapId).first()
        .then(function(map) {
          res.send(map)
        })
      } else {
        res.send(map);
      }
    })
})

app.get('/api/mappers/dropdown', function(req, res) {
  knex.select('mappers.id as key', 'mappers.id as value', 'mappers.name as text')
    .from('mappers')
    .then(function(mappers) {
      res.send(mappers);
    })
})

app.get('/api/mappers', function(req, res) {
  knex.select('mappers.id', 'mappers.name')
    .from('mappers')
    .then(function(mappers) {
      res.send(mappers);
    })
})

app.post('/api/map', function(req, res) {
  knex.transaction(function(transaction) {
    return transaction
      .insert({
        name: req.body.name,
        description: req.body.description,
      })
      .into('maps')
      .returning('id')
      .then(function(mapId) {
        return Promise.all(req.body.authors.map(author => {
          return transaction
            .insert({
              mapper_id: author,
              map_id: mapId[0],
            })
            .into('authors')
        }))
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

app.put('/api/map/:id', function(req, res) {
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
        req.body.authors.map(author => {
          if(current_authors.includes(author) === false) {
            knex('authors')
              .insert({
                mapper_id: author,
                map_id: req.params.id
              })
              .then(() => {
              })
          } 
        })
        current_authors.map(author => {
          if(req.body.authors.includes(author) === false) {
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
  
        res.send({
          success: 'Successfully updated map'
        })
      })
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

app.post('/api/map/:id/screenshots', function(req, res) {
  // Only accept JPG or PNG images
  if(['image/png', 'image/jpeg'].includes(req.files.file.mimetype) === false) {
    res.status(400).send({ error: 'Uploaded file must be of type JPG or PNG' })
  } else if(req.files.file.truncated) {
    res.status(400).send({ error: 'File exceeds 5MB limit' })
  } else {
    knex.select('maps.id')
    .from('maps')
    .where('maps.id', req.params.id)
    .first()
    .then(function(map) {
      if(map.id) {
        let imageFile = req.files.file;
        console.log(imageFile);
        let imageFileName = `${Date.now().toString()}${req.files.file.name}`;
        let imageFilePath = `${__dirname}/${imageFileName}`;
        let thumbnailName = `${Date.now().toString()}${req.files.file.name}-thumbnail.jpg`
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

function getComments(mapId) {
  return new Promise(function(resolve, reject) {
    knex.select('users.id as user_id', 'users.username', 'map_comments.comment', 'map_comments.id as comment_id', 'map_comments.reply_to_id')
      .from('map_comments')
      .leftOuterJoin('users', 'map_comments.user_id', 'users.id')
      .innerJoin('maps', 'map_comments.map_id', 'maps.id')
      .where('maps.id', mapId)
      .then(function(comments) {
        resolve(comments)
      })
  })
}

function formatToNestedComments(comments) {
  var nestedComments = comments.map(comment => {
    comment.replies = [];
    return comment;
  })

  nestedComments.map((replyComment, index) => {
    if(replyComment.reply_to_id) {
      nestedComments.map(parentComment => {
        if(parentComment.comment_id === replyComment.reply_to_id) {
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

app.post('/api/map/:id/comments', function(req, res) {
  const replyToId = req.body.reply_to_id;

  // Make sure user is logged in
  if(req.session.userId === undefined) {
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
              user_id: req.session.userId,
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
          user_id: req.session.userId,
          map_id: comment.map_id,
          reply_to_id: req.body.reply_to_id,
        })
        .then(() =>
          getComments(comment.map_id)
            .then(function(comments) {
              console.log(comments)
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
    knex.select('map_comments.id', 'map_comments.user_id')
    .from('map_comments')
    .where('map_comments.id', req.body.comment_id)
    .first()
    .then(function(comment) {
      if(comment.user_id === req.session.userId) {
        knex('map_comments')
          .where('map_comments.id', comment.id)
          .update({
            comment: '[deleted]',
            user_id: null,
          })
          .then(function() {
            getComments(req.params.id)
            .then(function(comments) {
              console.log(comments);
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

  knex.select('mappers.name', 
      knex.raw('array_agg(maps.name) as maps'),
      knex.raw('array_agg(maps.id) as map_ids'))
    .from('mappers')
    .innerJoin('authors', 'mappers.id', 'authors.mapper_id')
    .innerJoin('maps', 'maps.id', 'authors.map_id')
    .where('mappers.id', mapperId)
    .groupBy('mappers.name')
    .first()
    .then(function(mapper) {
      res.send(mapper);
    })
})

app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../../dist/index.html'))
})

app.listen(process.env.PORT || 8080, () => console.log(`Server listening on port ${process.env.PORT || 8080}`))