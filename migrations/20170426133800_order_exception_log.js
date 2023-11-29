exports.up = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.text('error_log').after('force_vendors').defaultTo(1);
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.dropColumn('error_log');
    });
};
