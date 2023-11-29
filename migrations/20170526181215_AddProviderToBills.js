exports.up = function (knex) {
    return knex.schema.table('storehouse_bills', (table) => {
        table.string('vendor').after('id').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('storehouse_bills', (table) => {
        table.dropColumn('vendor');
    });
};
