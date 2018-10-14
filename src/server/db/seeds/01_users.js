const bcrypt = require('bcryptjs');

exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function() {
      return knex('users').insert([
        {
          username: 'bob',
          email: 'bob@example.com', 
          password: bcrypt.hashSync('123456', 10),
          is_admin: true,
        },
        {
          username: 'tom',
          email: 'tom@example.com', 
          password: bcrypt.hashSync('123456', 10),
          is_admin: false,
        },
        {
          username: 'rob', 
          email: 'rob@example.com', 
          password: bcrypt.hashSync('123456', 10),
          is_admin: false,
        },
      ])
    })
}