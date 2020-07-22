import { S3 } from "aws-sdk";
import { commonHeaders } from "./headers";

export const getS3Client = (): S3 => {
  return new S3({
    endpoint: process.env.AWS_LAMBDA_S3_URL,
    accessKeyId: process.env.AWS_LAMBDA_ACCESS_KEY,
    secretAccessKey: process.env.AWS_LAMBDA_SECRET_KEY,
    signatureVersion: "v4",
    region: process.env.AWS_LAMBDA_REGION,
    apiVersion: "2006-03-01",
    s3ForcePathStyle: true,
  });
};

export const awsLambdaResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      ...commonHeaders,
    },
  };
};
