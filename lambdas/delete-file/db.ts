import Knex from "knex";
import * as knexConfig from "../../shared/knex";
import { File } from "../../shared/interfaces";

export async function deleteFileByKey(key: string): Promise<void> {
  const knex = Knex(knexConfig);
  await knex
    .from("files")
    .where("key", key)
    .delete()
    .finally(async () => {
      await knex.destroy();
    });
}

export async function findFile(key: string): Promise<File | undefined> {
  const knex = Knex(knexConfig);
  return knex
    .where({ key })
    .first()
    .select()
    .from<File>("files")
    .then((file) => {
      return file;
    })
    .finally(async () => {
      await knex.destroy();
    });
}
