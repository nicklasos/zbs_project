exports.up = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.string('game').after('client_id').default('csgo');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.dropColumn('game');
    });
};
