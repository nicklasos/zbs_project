exports.up = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.string('client_id').after('id').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.dropColumn('client_id');
    });
};
