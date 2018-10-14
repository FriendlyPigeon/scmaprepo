
exports.up = function(knex, Promise) {
  return knex.schema
  .createTable('mappers', function(table) {
    table.increments();
    table.string('name').notNullable();
    table.integer('user_id').references('users.id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('mappers');
};
