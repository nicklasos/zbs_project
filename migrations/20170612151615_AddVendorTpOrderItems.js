exports.up = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.string('vendor').after('price').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.dropColumn('vendor');
    });
};
