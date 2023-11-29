exports.up = function (knex) {
    return knex.schema.table('storehouse_bills', (table) => {
        table.string('bot_steamid').after('id');
    });
};

exports.down = function (knex) {
    return knex.schema.table('storehouse_bills', (table) => {
        table.dropColumn('bot_steamid');
    });
};
