exports.up = function (knex) {
    return knex.schema.createTable('move_offer_items', (table) => {
        table.increments();

        table.integer('move_offer_id');
        table.string('game');
        table.string('hash');
        table.string('assetid');

        table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('move_offer_items');
};

