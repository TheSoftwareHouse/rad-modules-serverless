import { File } from "../../shared/interfaces";
import Knex from "knex";
import * as knexConfig from "../../shared/knex";

export async function addCreateFileInfoInDb(file: File): Promise<File> {
  const knex = Knex(knexConfig);
  return knex
    .insert(file)
    .into("files")
    .returning("*")
    .then((files) => files![0])
    .finally(async () => {
      await knex.destroy();
    });
}
