import { fail } from "assert";
import { expect } from "chai";
import * as sinon from "sinon";
import request from "supertest";
import { getFile } from "./get-file";

describe("get-file", () => {
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

  it("Should get file", async () => {
    const fileObj = {
      id: 1,
      fileName: "test.jpg",
      description: "desc",
      bucket: "private",
      status: 1,
      fileType: "jpg",
      permission: "private",
      key: "d4caae6b-ff44-43cd-b2d6-12fe5c216cf4",
      createdAt: "2020-05-11T10:10:17.573Z",
    };
    const getFileMock = sinon.fake.returns(fileObj);

    const file = await getFile("d4caae6b-ff44-43cd-b2d6-12fe5c216cf4", awsClientMock, getFileMock);

    expect(file).to.deep.equal({
      ...fileObj,
      signedUrl: "http://signed.url/with/key",
    });
  });

  it("Should return 404 when file does not exists", async () => {
    return getFile("not-exists", awsClientMock, () => Promise.resolve(undefined))
      .then(() => fail("File should not exist"))
      .catch(() => true);
  });

  it("GET /dev/file missing query param returns 400", () => {
    return server.get("/dev/file").expect(400);
  });

  it("GET /dev/file?key=missing-file missing query param returns 404", () => {
    return server.get("/dev/file").query({ key: "missing-file" }).expect(404);
  });
});
