
exports.up = function(knex, Promise) {
  return knex.schema
  .createTable('authors', function(table) {
    table.increments();
    table.integer('mapper_id').references('mappers.id').notNullable().onDelete('cascade');
    table.integer('map_id').references('maps.id').notNullable().onDelete('cascade');
    table.unique(['mapper_id', 'map_id']);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('authors');
};
