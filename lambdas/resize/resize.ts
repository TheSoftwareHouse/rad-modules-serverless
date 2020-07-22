import { S3Event } from "aws-lambda";
import { S3 } from "aws-sdk";
import * as path from "path";
import sharp from "sharp";
import { getS3Client } from "../../shared/aws";
import { ThumbnailSize } from "./interfaces";

const THUMB_SIZES_REGEX = /((?<width>\d+)x(?<height>\d+):(?<fit>\w+))+/gi;
const FILE_NAME_POSTFIX_PATTERN = "-original";

export const parseFit = (fit: string) => {
  const keys = ["contain", "cover", "fill", "inside", "outside"];
  if (!keys.includes(fit)) {
    throw new Error(`[${fit}] provided is not allowed, available fits: ${keys.join(",")}`);
  }
  return fit as keyof sharp.FitEnum;
};

const getPostfix = (width: number, height: number) => `${width}-${height}`;
const getThumbnailName = (key: string, width: number, height: number, ext: string) =>
  `${key.replace(FILE_NAME_POSTFIX_PATTERN, "")}-${getPostfix(width, height)}${ext}`;

export const getThumbSizes = () => {
  const sizesFromEnv = process.env.THUMB_IMAGES_SIZES ?? "";
  const sizes = [...sizesFromEnv.matchAll(THUMB_SIZES_REGEX)].filter((i) => i.groups);
  if (sizes.length > 0) {
    return sizes.map(
      (i) => ({ width: +i.groups!.width, height: +i.groups!.height, fit: parseFit(i.groups!.fit) } as ThumbnailSize),
    );
  }
  throw new Error("Thumbnail sizes not provided (example: 100x100:cover,150x150:fill)");
};

export const isThumbnailExistsInS3 = async (bucketName: string, fileName: string, s3Client: S3) => {
  try {
    await s3Client
      .headObject({
        Bucket: bucketName,
        Key: fileName,
      })
      .promise();
    return true;
  } catch (error) {
    if (error.code === "NotFound") {
      return false;
    }
    throw error;
  }
};

async function resize(fileName: string, bucketName: string, size: ThumbnailSize, s3Client: S3, sharpClient = sharp) {
  const file = path.parse(fileName);
  const thumbnailFilename = getThumbnailName(file.name, size.width, size.height, file.ext);
  const isThumbnailExists = await isThumbnailExistsInS3(bucketName, thumbnailFilename, s3Client);
  if (isThumbnailExists) {
    return;
  }

  const imageObject = await s3Client
    .getObject({
      Bucket: bucketName,
      Key: fileName,
    })
    .promise();

  const image = sharpClient(imageObject.Body as Buffer);
  const imageMetadata = await image.metadata();
  const thumbnail = image.resize({ width: size.width, height: size.height, fit: size.fit });

  const thumbnailBuffer = await thumbnail.toBuffer();
  await s3Client
    .putObject({
      Bucket: bucketName,
      Body: thumbnailBuffer,
      Key: thumbnailFilename,
      ContentType: `image/${imageMetadata.format}`,
      ContentLength: thumbnailBuffer.byteLength,
    })
    .promise();
}

export async function resizeImage(event: S3Event, s3Client: S3 = getS3Client(), sharpClient = sharp): Promise<void> {
  const eventData = event.Records[0].s3;
  const fileName = eventData.object.key;
  const bucketName = eventData.bucket.name;
  const sizes = getThumbSizes();

  if (!fileName.includes(FILE_NAME_POSTFIX_PATTERN)) {
    // generate thumbnails only for file with -original postfix
    return;
  }

  await Promise.all(sizes.map((size) => resize(fileName, bucketName, size, s3Client, sharpClient)));
}
