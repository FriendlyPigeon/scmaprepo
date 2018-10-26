exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function() {
      return knex('users').insert([
        {
          username: 'bob',
          email: 'bob@example.com',
          steam_id: '76561198007950805'
        },
        {
          username: 'tom',
          email: 'tom@example.com',
          steam_id: '55555555555555555'
        },
        {
          username: 'rob', 
          email: 'rob@example.com',
          steam_id: '66666666666666666'
        },
      ])
    })
}