exports.up = function (knex) {
  return knex.schema.table('bots', (table) => {
    table.boolean('ready').defaultTo(false).after('enabled');
  });
};

exports.down = function (knex) {
  return knex.schema.table('bots', (table) => {
    table.dropColumn('ready');
  });
};
