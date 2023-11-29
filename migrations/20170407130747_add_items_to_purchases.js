exports.up = function (knex) {
  return knex.schema.table('purchases', (table) => {
    table.text('items').after('provider');
  });
};

exports.down = function (knex) {
  return knex.schema.table('purchases', (table) => {
    table.dropColumn('items');
  });
};
