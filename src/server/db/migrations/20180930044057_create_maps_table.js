
exports.up = function(knex, Promise) {
  return knex.schema
  .createTable('maps', function(table) {
    table.increments();
    table.string('name').notNullable();
    table.string('uploader').references('users.steam_id').notNullable();
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('maps');
};
