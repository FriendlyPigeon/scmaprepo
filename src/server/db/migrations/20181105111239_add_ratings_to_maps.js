
exports.up = function(knex, Promise) {
  return knex.schema
  .createTable('map_ratings', function(table) {
    table.increments();
    table.decimal('rating');
    table.string('steam_id').references('users.steam_id').notNullable().onDelete('cascade');
    table.integer('map_id').references('maps.id').notNullable().onDelete('cascade');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema
  .dropTable('map_ratings');
};
