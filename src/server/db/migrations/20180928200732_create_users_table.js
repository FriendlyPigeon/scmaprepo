
exports.up = function(knex, Promise) {
  return knex.schema
  .createTable('users', function(table) {
    table.increments();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.boolean('is_admin').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex, Promise) {
  return knex.schema
  .dropTable('users');
};
