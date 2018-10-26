exports.seed = function(knex, Promise) {
  return knex('maps').del()
    .then(function() {
      return knex('maps').insert([
        {name: 'test1', description: 'test description1'},
        {name: 'test2', description: 'test description2'},
        {name: 'test3', description: 'test description3'},
      ])
    })
}