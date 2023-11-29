exports.up = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.string('screenshot').after('tradeofferid').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.dropColumn('screenshot');
    });
};
