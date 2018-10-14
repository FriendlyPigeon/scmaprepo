exports.seed = function(knex, Promise) {
  return knex('authors').del()
    .then(function() {
      return knex('authors').insert([
        {mapper_id: 1, map_id: 1},
        {mapper_id: 1, map_id: 2},
        {mapper_id: 1, map_id: 3},
        {mapper_id: 2, map_id: 2},
        {mapper_id: 3, map_id: 3},
      ])
    })
}