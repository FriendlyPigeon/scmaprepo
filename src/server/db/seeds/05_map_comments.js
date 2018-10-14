exports.seed = function(knex, Promise) {
  return knex('map_comments').del()
    .then(function() {
      return knex('map_comments').insert([
        {comment: 'nice', user_id: 1, map_id: 1},
        {comment: 'cool', user_id: 1, map_id: 2},
        {comment: 'looks fun', user_id: 2, map_id: 3},
        {comment: 'lossy is a fagit', user_id: 2, map_id: 2},
        {comment: '11/10', user_id: 3, map_id: 1},
      ])
    })
}