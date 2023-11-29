exports.up = function (knex) {
  return knex.schema.createTable('order_items', (table) => {
    table.increments();
    table.string('status').defaultTo('new');
    table.string('order_id');
    table.string('hash');
    table.integer('count');
    table.string('payload');
    table.decimal('max_price');
    table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('order_items');
};
