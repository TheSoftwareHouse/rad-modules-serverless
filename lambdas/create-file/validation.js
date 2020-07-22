import * as joi from "@hapi/joi";
import { Permission, UploadStatus } from "../../shared/interfaces";

export const eventSchemaValidation = joi.object({
  fileName: joi.string().required(),
  description: joi.string().max(255),
  fileType: joi.string().required(),
  permission: joi.string().valid(Permission.PUBLIC, Permission.PRIVATE).required(),
});

export const fileSchemaValidation = joi.object({
  key: joi.string().required(),
  fileName: joi.string().required(),
  description: joi.string().max(255),
  fileType: joi.string().required(),
  permission: joi.string().valid(Permission.PUBLIC, Permission.PRIVATE).required(),
  id: joi.number().required(),
  bucket: joi.string().required(),
  createdAt: joi.date().required(),
  status: joi.number().valid(UploadStatus.CANCEL, UploadStatus.DONE, UploadStatus.IN_PROGRESS).required(),
  signedUrl: joi.string().required(),
});
