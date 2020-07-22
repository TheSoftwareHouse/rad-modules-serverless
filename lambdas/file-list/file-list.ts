import { FileFilter } from "../../shared/interfaces";
import { getFiles, GetFilesData } from "./db";

export async function getFilesList(
  filter: FileFilter,
  getFilesActionFunction: (filters: FileFilter) => Promise<GetFilesData> = getFiles,
) {
  return getFilesActionFunction(filter);
}
