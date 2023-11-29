exports.up = function (knex) {
    return knex.schema.createTable('order_logs', (table) => {
        table.increments();
        table.integer('order_id');
        table.string('status');
        table.text('message');
        table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('order_logs');
};
