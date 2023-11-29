exports.up = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.integer('storehouse_id').after('bot_id').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.dropColumn('storehouse_id');
    });
};
