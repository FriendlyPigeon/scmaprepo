
exports.up = function(knex, Promise) {
  return knex.schema.raw('alter table maps modify column description varchar(5000)')
};

exports.down = function(knex, Promise) {
  return knex.schema.raw('alter table maps modify column description varchar(255)')
};
