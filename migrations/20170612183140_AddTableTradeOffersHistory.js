exports.up = function (knex) {
    return knex.schema.createTable('trade_offers_history', (table) => {
        table.increments();
        table.integer('bot_id');
        table.longtext('page');
        table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('trade_offers_history');
};
