import { File } from "../../shared/interfaces";
import Knex from "knex";
import * as knexConfig from "../../shared/knex";

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
