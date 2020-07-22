import { deleteFileByKey, findFile } from "./db";
import { getS3Client } from "../../shared/aws";
import { File } from "../../shared/interfaces";
import { S3 } from "aws-sdk";
import { NotFoundError } from "../../shared/errors/not-found.error";

export const removeFromAws = (key: string, bucket: string, awsClient: S3) => {
  return awsClient.deleteObject({
    Bucket: bucket,
    Key: key,
  });
};

export const createDeleteFileHandler = (
  awsClient: S3 = getS3Client(),
  deleteFileInDb: (key: string) => Promise<void> = deleteFileByKey,
  findFileInDb: (key: string) => Promise<File | undefined> = findFile,
) => async (key: string) => {
  const file = await findFileInDb(key);

  if (!file) {
    throw new NotFoundError(`File with given key [${key}] does not exists.`);
  }

  await deleteFileInDb(file.key);
  await removeFromAws(file.key, file.bucket, awsClient);
};
