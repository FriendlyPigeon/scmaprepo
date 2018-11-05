
exports.up = function(knex, Promise) {
  console.log('reached');
  return knex.schema
  .createTable('users', function(table) {
    table.increments();
    table.string('username').unique().notNullable();
    table.string('steam_id').unique().notNullable();
    table.string('email').unique();
    table.boolean('is_admin').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex, Promise) {
  return knex.schema
  .dropTable('users');
};
