import * as joi from "@hapi/joi";
import { Callback, Context } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { awsLambdaResponse } from "../../shared/aws";
import { handleError } from "../../shared/error-handler";
import { LambdaEvent } from "../../shared/interfaces";
import { createFileHandler } from "./create-file";
import { eventSchemaValidation } from "./validation";

export async function handle(event: LambdaEvent, _: Context, callback: Callback): Promise<void> {
  try {
    const body = JSON.parse(event.body);
    const fileEvent = joi.attempt(body, eventSchemaValidation, { abortEarly: false });

    const createFile = createFileHandler();

    const file = await createFile({ key: `${uuid()}-original`, ...fileEvent });
    callback(null, awsLambdaResponse(201, file));
  } catch (error) {
    callback(null, handleError(error));
  }
}
