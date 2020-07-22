import * as Knex from "knex";

const TABLE_NAME = "files";

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments("id").unsigned().primary();
    t.string("fileName").notNullable();
    t.string("description").nullable();
    t.string("bucket").notNullable();
    t.integer("status").notNullable();
    t.string("fileType").notNullable();
    t.string("permission", 7).notNullable();
    t.string("key", 45).notNullable().unique();
    t.dateTime("createdAt").notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable(TABLE_NAME);
}
