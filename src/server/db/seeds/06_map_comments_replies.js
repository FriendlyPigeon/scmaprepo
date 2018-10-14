exports.seed = function(knex, Promise) {
  return knex('map_comments').insert([
    {comment: 'i agree', user_id: 1, map_id: 1, reply_to_id: 1},
    {comment: 'yes definitely', user_id: 1, map_id: 2, reply_to_id: 2},
    {comment: 'sounds good', user_id: 2, map_id: 3, reply_to_id: 3},
    {comment: 'lossy is a fagit, for sure', user_id: 2, map_id: 2, reply_to_id: 4},
    {comment: '12/10', user_id: 3, map_id: 1, reply_to_id: 5},
  ])
}