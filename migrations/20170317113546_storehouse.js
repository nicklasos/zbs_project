exports.up = function (knex) {
  return knex.schema.createTable('storehouse', (table) => {
    table.increments();
    table.string('bot_steamid');
    table.integer('order_item_id').nullable();
    table.string('hash');
    table.string('assetid');
    table.string('classid');
    table.string('instanceid');
    table.string('status');
    table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('storehouse');
};
