exports.up = function (knex) {
  return knex.schema.createTable('take_offers', (table) => {
    table.increments();

    table.integer('bot_id');
    table.string('status').default('new');
    table.string('client');
    table.string('trade_url');
    table.string('tradeofferid').nullable();
    table.text('items');
    table.string('callback');
    table.decimal('price').default(0);
    table.string('payload');
    table.string('text');

    table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('take_offers');
};
