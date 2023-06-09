
exports.up = function(knex, Promise) {
  return knex.schema
  .createTable('map_comments', function(table) {
    table.increments();
    table.string('comment', 5000).notNullable();
    table.string('steam_id').references('users.steam_id').notNullable();
    table.integer('map_id').references('maps.id').notNullable().onDelete('cascade');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('map_comments')
};
