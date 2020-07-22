import * as joi from "@hapi/joi";

export const querySchemaValidation = joi.object({
  key: joi.string().required(),
});
