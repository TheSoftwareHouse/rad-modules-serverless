import { Context, S3Event } from "aws-lambda";
import { watermarkImage } from "./watermark";

export async function handle(event: S3Event, _: Context): Promise<void> {
  await watermarkImage(event);
}
