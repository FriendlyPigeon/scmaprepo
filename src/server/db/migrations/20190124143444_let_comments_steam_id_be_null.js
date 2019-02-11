
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('map_comments', function(table) {
    table.dropForeign('steam_id');
    table.string('steam_id').references('users.steam_id').nullable().alter();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('map_comments', function(table) {
    table.dropForeign('steam_id');
    table.string('steam_id').references('users.steam_id').notNullable().alter();
  })
};
