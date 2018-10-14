
exports.up = function(knex, Promise) {
  return knex.schema
  .table('map_comments', function(table) {
    table.integer('reply_to_id').references('map_comments.id').defaultTo(null);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema
  .table('map_comments', function(table) {
    table.dropColumn('reply_to_id');
  });
};
