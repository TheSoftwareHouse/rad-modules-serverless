import { S3Event } from "aws-lambda";
import { S3 } from "aws-sdk";
import Jimp from "jimp";
import { getS3Client } from "../../shared/aws";

const OPTIONS_REGEX = /((?<positionX>\w+):(?<positionY>\w+):(?<opacity>\d*\.?\d))/i;
const FILE_NAME_POSTFIX_PATTERN = "-original";

export interface WatermarkOptions {
  positionX: "left" | "center" | "right";
  positionY: "top" | "middle" | "bottom";
  opacity: number; // 0 < 1
}

export const getWatermarkPosition = (
  sourceWith: number,
  sourceHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  options: WatermarkOptions,
) => {
  let [x, y] = [0, 0];
  if (options.positionX === "center") {
    x = (sourceWith - watermarkWidth) / 2;
  } else if (options.positionX === "right") {
    x = sourceWith - watermarkWidth;
  }

  if (options.positionY === "middle") {
    y = (sourceHeight - watermarkHeight) / 2;
  } else if (options.positionY === "bottom") {
    y = sourceHeight - watermarkHeight;
  }

  return [x, y];
};

export const getWatermarkOptions = () => {
  const optionsFromEnv = process.env.WATERMARK_OPTIONS ?? "";
  const parsedOptions = (OPTIONS_REGEX.exec(optionsFromEnv) ?? {}).groups ?? {};
  return {
    positionX: parsedOptions.positionX,
    positionY: parsedOptions.positionY,
    opacity: +parsedOptions.opacity,
  } as WatermarkOptions;
};

export const addWatermark = async (sourceFile: Buffer, watermarkFile: Buffer, options: WatermarkOptions) => {
  const main = await Jimp.read(sourceFile);
  const watermark = await Jimp.read(watermarkFile);
  const [x, y] = getWatermarkPosition(
    main.getWidth(),
    main.getHeight(),
    watermark.getWidth(),
    watermark.getHeight(),
    options,
  );
  watermark.opacity(options.opacity);
  main.composite(watermark, x, y);
  main.quality(100);
  return main;
};

export async function watermarkImage(event: S3Event, s3Client: S3 = getS3Client()): Promise<void> {
  const eventData = event.Records[0].s3;
  const fileName = eventData.object.key;
  const bucketName = eventData.bucket.name;

  if (!fileName.includes(FILE_NAME_POSTFIX_PATTERN)) {
    // generate watermark only for file with -original postfix
    return;
  }

  const imageObject = await s3Client
    .getObject({
      Bucket: bucketName,
      Key: fileName,
    })
    .promise();
  const watermarkObject = await s3Client
    .getObject({
      Bucket: process.env.WATERMARK_BUCKET!,
      Key: process.env.WATERMARK_FILENAME!,
    })
    .promise();

  const watermarkFile = Buffer.from(watermarkObject.Body!);
  const imageFile = Buffer.from(imageObject.Body!);
  const image = await addWatermark(imageFile, watermarkFile, getWatermarkOptions());
  const imageBuffer = await image.getBufferAsync(image.getMIME());

  await s3Client
    .putObject({
      Bucket: bucketName,
      Key: fileName.replace("-original", "-watermark"),
      Body: imageBuffer,
      ContentType: image.getMIME(),
    })
    .promise();
}
