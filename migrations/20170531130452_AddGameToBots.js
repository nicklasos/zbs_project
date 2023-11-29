exports.up = function (knex) {
    return knex.schema.table('bots', (table) => {
        table.string('game').after('steam_token').default('multi');
    });
};

exports.down = function (knex) {
    return knex.schema.table('bots', (table) => {
        table.dropColumn('game');
    });
};
