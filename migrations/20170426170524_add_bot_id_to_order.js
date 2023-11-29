exports.up = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.integer('bot_id').after('tries').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', (table) => {
        table.dropColumn('bot_id');
    });
};
