exports.up = function (knex) {
    return knex.schema.createTable('storehouse_bills', (table) => {
        table.increments();

        table.string('assetid');
        table.decimal('price');
        table.string('hash');

        table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('storehouse_bills');
};

