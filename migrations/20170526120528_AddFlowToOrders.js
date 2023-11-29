exports.up = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.string('flow').after('client_id').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.dropColumn('flow');
    });
};
