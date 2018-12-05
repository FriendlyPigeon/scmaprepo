
exports.up = function(knex, Promise) {
  return knex.schema.raw('alter table maps alter column description type varchar(5000)')
};

exports.down = function(knex, Promise) {
  return knex.schema.raw('alter table maps alter column description type varchar(255)')
};
