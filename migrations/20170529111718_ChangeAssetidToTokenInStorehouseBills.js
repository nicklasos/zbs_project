exports.up = function (knex) {
    return knex.schema.table('storehouse_bills', (table) => {
        table.renameColumn('assetid', 'token');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.renameColumn('token', 'assetid');
    });
};
