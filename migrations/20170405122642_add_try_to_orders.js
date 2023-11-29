exports.up = function (knex) {
  return knex.schema.table('orders', (table) => {
    table.integer('tries').after('status').defaultTo(1);
  });
};

exports.down = function (knex) {
  return knex.schema.table('orders', (table) => {
    table.dropColumn('tries');
  });
};
