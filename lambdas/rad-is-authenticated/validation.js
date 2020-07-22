import * as joi from "@hapi/joi";

export const headersSchemaValidation = joi.object({
  Authorization: joi.string().required(),
});
