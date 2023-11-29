exports.up = function (knex) {
    return knex.schema.table('storehouse_bills', (table) => {
        table.integer('storehouse_id').after('id').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('storehouse_bills', (table) => {
        table.dropColumn('storehouse_id');
    });
};
