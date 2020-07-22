import { addCreateFileInfoInDb } from "./db";
import { getS3Client } from "../../shared/aws";
import { Permission, UploadStatus, File, FileEvent } from "../../shared/interfaces";
import { S3 } from "aws-sdk";

export const getSignedUrl = (key: string, bucket: string, awsClient: S3) => {
  return awsClient.getSignedUrl("putObject", {
    Bucket: bucket,
    Key: key,
  });
};

export const getFileData = (fileEvent: FileEvent, bucket: string): File => {
  return {
    ...fileEvent,
    createdAt: new Date(),
    status: UploadStatus.IN_PROGRESS,
    bucket,
  } as File;
};

export const createFileHandler = (
  awsClient: S3 = getS3Client(),
  saveInDbFunction: (file: File) => Promise<File> = addCreateFileInfoInDb,
) => async (fileEvent: FileEvent) => {
  const bucket: string =
    fileEvent.permission === Permission.PUBLIC
      ? process.env.AWS_LAMBDA_S3_PUBLIC_BUCKET ?? ""
      : process.env.AWS_LAMBDA_S3_PRIVATE_BUCKET ?? "";
  const signedUrl = getSignedUrl(fileEvent.key, bucket, awsClient);
  const fileToAdd = getFileData(fileEvent, bucket);
  const file = await saveInDbFunction(fileToAdd);
  return { ...file, signedUrl };
};
