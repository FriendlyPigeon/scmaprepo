exports.seed = function(knex, Promise) {
  return knex('maps').del()
    .then(function() {
      return knex('maps').insert([
        {name: 'test1'},
        {name: 'test2'},
        {name: 'test3'},
      ])
    })
}