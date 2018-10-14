exports.seed = function(knex, Promise) {
  return knex('mappers').del()
    .then(function() {
      return knex('mappers').insert([
        {name: 'bob', user_id: 1},
        {name: 'tom', user_id: 2},
        {name: 'rob', user_id: 3},
      ])
    })
}