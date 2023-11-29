exports.up = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.string('tradeofferid').after('error_log').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.dropColumn('tradeofferid');
    });
};
