import { File, FileResponse } from "../../shared/interfaces";
import { findFile } from "./db";
import { S3 } from "aws-sdk";
import { getS3Client } from "../../shared/aws";
import { NotFoundError } from "../../shared/errors/not-found.error";

export async function getFile(
  key: string,
  awsClient: S3 = getS3Client(),
  findFileInDb: (key: string) => Promise<File | undefined> = findFile,
): Promise<FileResponse> {
  const file = await findFileInDb(key);

  if (!file) {
    throw new NotFoundError(`File with given key [${key}] does not exists.`);
  }

  const signedUrl = awsClient.getSignedUrl("getObject", {
    Bucket: file.bucket,
    Key: file.key,
  });
  return { ...file, signedUrl } as FileResponse;
}
