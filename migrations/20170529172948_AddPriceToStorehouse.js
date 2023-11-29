exports.up = function (knex) {
    return knex.schema.table('storehouse', (table) => {
        table.decimal('price').after('hash').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('storehouse', (table) => {
        table.dropColumn('price');
    });
};
