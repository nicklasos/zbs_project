exports.up = function (knex) {
  return knex.schema.table('bots', (table) => {
    table.timestamp('last_ready_at').after('ready').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
  });
};

exports.down = function (knex) {
  return knex.schema.table('bots', (table) => {
    table.dropColumn('last_ready_at');
  });
};
