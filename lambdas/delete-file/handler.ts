import * as joi from "@hapi/joi";
import { Callback, Context } from "aws-lambda";
import { awsLambdaResponse } from "../../shared/aws";
import { handleError } from "../../shared/error-handler";
import { LambdaEvent } from "../../shared/interfaces";
import { createDeleteFileHandler } from "./delete-file";
import { querySchemaValidation } from "./validation";

export async function handle(event: LambdaEvent, _: Context, callback: Callback): Promise<void> {
  try {
    const query = joi.attempt(event.queryStringParameters, querySchemaValidation, { abortEarly: false });

    const deleteFile = createDeleteFileHandler();

    await deleteFile(query.key);
    callback(null, awsLambdaResponse(204, ""));
  } catch (error) {
    callback(null, handleError(error));
  }
}
