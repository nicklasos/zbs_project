exports.up = function (knex) {
  return knex.schema.createTable('orders', (table) => {
    table.increments();
    table.string('status').defaultTo('new');
    table.string('trade_url');
    table.string('agent_id');
    table.string('comment');
    table.string('priority');
    table.string('quality');
    table.string('vendors');
    table.boolean('force_vendors');
    table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('orders');
};
