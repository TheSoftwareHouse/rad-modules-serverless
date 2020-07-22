import { File, FileFilter, PaginatedMeta } from "../../shared/interfaces";
import Knex from "knex";
import * as knexConfig from "../../shared/knex";

export function getKnexInstance(config: Knex.Config = knexConfig): Knex {
  return Knex(config);
}

export interface GetFilesData extends PaginatedMeta {
  files: File[];
}

export async function getFiles(filter: FileFilter, knex: Knex = getKnexInstance()): Promise<GetFilesData> {
  const query = knex.from<File>("files");
  if (filter.permission) {
    query.where("permission", filter.permission);
  }
  if (filter.fileName) {
    query.where("fileName", "like", `%${filter.fileName}%`);
  }
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 25;
  const offset = (page - 1) * limit;

  const files = await query.clone().offset(offset).limit(limit).select();
  const total = await query.clone().count();
  await knex.destroy();
  return {
    files,
    meta: {
      total: <number>total[0].count,
      page,
      limit,
    },
  };
}
