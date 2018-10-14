const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');
const bodyParser = require('body-parser');
const knex = require('./db/knex');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('dist'));

app.use(session({
  secret: 'some secret',
  saveUninitialized: true,
  resave: false,
}));

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
  check('email', 'Email is taken').custom(email => findEmail(email)),
  check('password', 'Password must be at least 6 characters').isLength(6),
  check('password2', 'Passwords do not match').custom((password2, { req }) => password2 === req.body.password)
], (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const passwordHash = bcrypt.hashSync(req.body.password, 10);

  knex('users')
    .insert({
      username: req.body.username,
      email: req.body.email,
      password: passwordHash,
    })
    .returning(['username', 'email'])
    .then(function(username, email) {
      return res.send({
        username: username,
        email: email
      })
    })
})

app.get('/api/users/heartbeat', function(req, res) {
  if(req.session && req.session.userId) {
    res.send({
      authenticated: true,
      userId: req.session.userId,
    })
  } else {
    res.send({
      authenticated: false
    })
  }
}) 

app.post('/api/users/login', function(req, res) {
  if(!req.body.email) {
    return res.send({
      error: 'You must enter an email to login'
    })
  }

  knex.select('password')
    .from('users')
    .where('email', req.body.email)
    .first()
    .then(function(storedPassword) {
      if(!storedPassword) {
        return res.send({
          error: 'Invalid email or password'
        })
      } else {
        bcrypt.compare(req.body.password, storedPassword.password)
        .then(passwordsMatch => {
          if(passwordsMatch) {
            knex.select('id')
              .from('users')
              .where('email', req.body.email)
              .first()
              .then(userId =>
                req.session.userId = userId.id
              )
              .then(() =>
                res.send({
                  success: 'Successful login',
                  userId: req.session.userId,
                })
              )
          } else {
            return res.send({
              error: 'Invalid email or password'
            })
          }
        })
        .catch(error => {
          console.log(error)
        })
      }
    })
})

app.get('/api/users/logout', function(req, res) {
  if(req.session.user) {
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

  knex.select('maps.name',
      knex.raw('array_agg(mappers.name) as authors'),
      knex.raw('array_agg(authors.mapper_id) as mapper_ids'))
    .from('maps')
    .innerJoin('authors', 'maps.id', 'authors.map_id')
    .innerJoin('mappers', 'authors.mapper_id', 'mappers.id')
    .where('maps.id', mapId)
    .groupBy('maps.name')
    .first()
    .then(function(map) {
      // If there are no authors of a map, just return the map name
      if(map === undefined) {
        knex.select('maps.name').from('maps').where('maps.id', mapId).first()
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

app.put('/api/map/:id', function(req, res) {
  knex('authors')
    .select('authors.mapper_id')
    .where('authors.map_id', req.params.id)
    .then(function(current_authors_object) {
      const current_authors = current_authors_object.map(author =>
        author.mapper_id
      )
      console.log(current_authors)
      req.body.authors.map(author => {
        if(current_authors.includes(author) === false) {
          console.log(author)
          knex('authors')
            .insert({
              mapper_id: author,
              map_id: req.params.id
            })
            .then(function(id) {
              console.log(id)
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
            .then(function(id) {
              console.log(id)
            })
        }
      })

      res.send({
        success: 'Successfully updated map'
      })
    })
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

if(module === require.main) {
  const server = app.listen(8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;