import { Callback, Context } from "aws-lambda";
import { awsLambdaResponse } from "../../shared/aws";
import { handleError } from "../../shared/error-handler";
import { LambdaEvent } from "../../shared/interfaces";
import { getFilesList } from "./file-list";

export async function handle(event: LambdaEvent, _: Context, callback: Callback): Promise<void> {
  try {
    const filesAndMeta = await getFilesList(event.queryStringParameters ?? {});
    callback(
      null,
      awsLambdaResponse(200, {
        data: filesAndMeta.files,
        meta: filesAndMeta.meta,
      }),
    );
  } catch (error) {
    callback(null, handleError(error));
  }
}
