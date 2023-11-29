exports.up = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.integer('bot_id').after('order_id').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.dropColumn('bot_id');
    });
};
