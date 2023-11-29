exports.up = function (knex) {
    return knex.schema.table('storehouse', (table) => {
        table.string('vendor').after('price').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('storehouse', (table) => {
        table.dropColumn('vendor');
    });
};
