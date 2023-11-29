exports.up = function (knex) {
  return knex.schema.createTable('purchases', (table) => {
    table.increments();
    table.string('bot_id');
    table.string('provider');
    table.decimal('price');
    table.bool('withdrawn').default(false);
    table.text('buy_log').nullable();
    table.text('withdraw_log').nullable();
    table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('purchases');
};
