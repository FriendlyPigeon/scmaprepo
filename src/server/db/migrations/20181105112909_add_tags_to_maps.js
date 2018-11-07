
exports.up = function(knex, Promise) {
  return knex.schema
  .createTable('map_tags', function(table) {
    table.increments();
    table.integer('tag_id').references('tags.id').notNullable().onDelete('cascade');
    table.integer('map_id').references('maps.id').notNullable().onDelete('cascade');
    table.unique(['tag_id', 'map_id']);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema
  .dropTable('map_tags');
};
