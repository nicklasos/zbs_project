exports.up = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.decimal('price').after('bot_id').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.dropColumn('price');
    });
};
