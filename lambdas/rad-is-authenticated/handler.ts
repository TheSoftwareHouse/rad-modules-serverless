import * as joi from "@hapi/joi";
import { Callback, Context } from "aws-lambda";
import { awsLambdaResponse } from "../../shared/aws";
import { handleError } from "../../shared/error-handler";
import { LambdaEvent } from "../../shared/interfaces";
import { isAuthenticated } from "./is-authenticated";
import { headersSchemaValidation } from "./validation";

export async function handle(event: LambdaEvent, _: Context, callback: Callback): Promise<void> {
  try {
    const headers = joi.attempt(event.headers, headersSchemaValidation, { abortEarly: false, allowUnknown: true });

    const authenticated = await isAuthenticated(headers.Authorization);
    callback(
      null,
      awsLambdaResponse(200, {
        isAuthenticated: authenticated,
      }),
    );
  } catch (error) {
    callback(null, handleError(error));
  }
}
