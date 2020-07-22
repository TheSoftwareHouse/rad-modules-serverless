import { expect } from "chai";
import { getSignedUrl, getFileData, createFileHandler } from "./create-file";
import { Permission, FileEvent } from "../../shared/interfaces";
import * as sinon from "sinon";
import request from "supertest";
import * as joi from "@hapi/joi";
import { fileSchemaValidation } from "./validation";

describe("create-file", () => {
  let getSignedUrlMock: any;
  let awsClientMock: any;
  const server = request("http://localhost:1337");

  beforeEach(() => {
    getSignedUrlMock = sinon.fake.returns("http://signed.url/with/key");
    awsClientMock = { getSignedUrl: getSignedUrlMock };
    process.env.AWS_LAMBDA_S3_PUBLIC_BUCKET = "public";
    process.env.AWS_LAMBDA_S3_PRIVATE_BUCKET = "private";
  });

  afterEach(() => {
    delete process.env.AWS_LAMBDA_S3_PUBLIC_BUCKET;
    delete process.env.AWS_LAMBDA_S3_PRIVATE_BUCKET;
  });

  it("Should get presigned data", () => {
    const result = getSignedUrl("key", "bucketName", awsClientMock);

    expect(result).to.equal("http://signed.url/with/key");
    expect(getSignedUrlMock.lastCall.lastArg).to.deep.equal({
      Bucket: "bucketName",
      Key: "key",
    });
  });

  it("Should get file data to save in database", async () => {
    const fileEvent = {
      fileName: "my_name",
      description: "description",
      fileType: "jpg",
      permission: Permission.PUBLIC,
      key: "key",
    } as FileEvent;
    const now = new Date();
    const clock = sinon.useFakeTimers(now);

    const result = getFileData(fileEvent, "private");

    expect(result).to.deep.equal({
      createdAt: now,
      description: "description",
      fileName: "my_name",
      fileType: "jpg",
      key: "key",
      permission: "public",
      bucket: "private",
      status: 1,
    });
    clock.restore();
  });

  it("Should create new file in db", async () => {
    const fileEvent = {
      fileName: "my_name",
      description: "description",
      fileType: "jpg",
      permission: Permission.PUBLIC,
      key: "key",
    } as FileEvent;
    const now = new Date();
    const clock = sinon.useFakeTimers(now);
    const expectEventData = {
      createdAt: now,
      description: "description",
      fileName: "my_name",
      fileType: "jpg",
      key: "key",
      bucket: "public",
      permission: "public",
      status: 1,
    };
    const saveInDbMock = sinon.fake.returns({ ...expectEventData, id: 1 });

    const createFile = createFileHandler(awsClientMock, saveInDbMock);
    const result = await createFile(fileEvent);

    expect(result).to.deep.equal({
      ...expectEventData,
      id: 1,
      signedUrl: "http://signed.url/with/key",
    });
    expect(getSignedUrlMock.lastCall.lastArg).to.deep.equal({
      Bucket: "public",
      Key: "key",
    });
    expect(saveInDbMock.lastCall.lastArg).to.deep.equal(expectEventData);
    clock.restore();
  });

  it("POST /dev/upload missing params returns 400", () => {
    return server.post("/dev/upload").expect(400);
  });

  it("POST /dev/upload return 200", () => {
    return server
      .post("/dev/upload")
      .send({
        fileName: "my-file",
        description: "some file",
        fileType: "jpg",
        permission: Permission.PUBLIC,
      })
      .expect(201)
      .then((response) => joi.attempt(response.body, fileSchemaValidation));
  });
});
