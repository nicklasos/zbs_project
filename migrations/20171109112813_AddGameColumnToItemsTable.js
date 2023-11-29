exports.up = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.string('game').after('id').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('order_items', (table) => {
        table.dropColumn('game');
    });
};
