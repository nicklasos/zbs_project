exports.up = function (knex) {
    return knex.schema.table('storehouse', (table) => {
        table.string('game').after('id').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('storehouse', (table) => {
        table.dropColumn('game');
    });
};
