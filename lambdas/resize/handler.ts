import { Context, S3Event } from "aws-lambda";
import { resizeImage } from "./resize";

export async function handle(event: S3Event, _: Context): Promise<void> {
  await resizeImage(event);
}
