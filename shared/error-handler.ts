import { ValidationError } from "@hapi/joi";
import { awsLambdaResponse } from "./aws";
import { AppError } from "./errors/app.error";
import { HttpError } from "./errors/http.error";

export const handleError = (error) => {
  if (error instanceof ValidationError) {
    return awsLambdaResponse(400, error.details);
  } else if (error instanceof HttpError) {
    return awsLambdaResponse(error.status, error.message);
  } else if (error instanceof AppError) {
    return awsLambdaResponse(500, error.message);
  } else {
    return awsLambdaResponse(500, "Unknown error");
  }
};
