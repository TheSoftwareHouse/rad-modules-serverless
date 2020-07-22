import * as joi from "@hapi/joi";
import { Callback, Context } from "aws-lambda";
import { awsLambdaResponse } from "../../shared/aws";
import { handleError } from "../../shared/error-handler";
import { LambdaEvent } from "../../shared/interfaces";
import { getFile } from "./get-file";
import { querySchemaValidation } from "./validation";

export async function handle(event: LambdaEvent, _: Context, callback: Callback): Promise<void> {
  try {
    joi.attempt(event.queryStringParameters, querySchemaValidation, { abortEarly: false });

    const file = await getFile(event.queryStringParameters!.key);
    callback(null, awsLambdaResponse(200, file));
  } catch (error) {
    callback(null, handleError(error));
  }
}
