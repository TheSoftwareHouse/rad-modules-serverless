export enum UploadStatus {
  IN_PROGRESS = 1,
  DONE = 2,
  CANCEL = 3,
}

export enum Permission {
  PUBLIC = "public",
  PRIVATE = "private",
}

export interface FileEvent {
  key: string;
  fileName: string;
  description: string;
  fileType: string;
  permission: Permission;
}

export interface File extends FileEvent {
  id: number;
  createdAt: Date;
  status: UploadStatus;
  bucket: string;
}

export interface CreateFileResponse extends File {
  signedUrl: string;
}

export interface FileResponse extends File {
  signedUrl: string;
}

export interface LambdaEvent {
  body: string;
  queryStringParameters?: { [key: string]: any };
  headers?: { [key: string]: any };
}

export interface FileFilter {
  permission?: Permission;
  fileName?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedMeta {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
