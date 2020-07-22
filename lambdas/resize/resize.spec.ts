import { S3Event } from "aws-lambda";
import { expect } from "chai";
import * as sinon from "sinon";
import { getThumbSizes, parseFit, resizeImage } from "./resize";
import { AWSError } from "aws-sdk";

const createEvent = (key: string) => {
  return {
    Records: [
      {
        s3: {
          bucket: {
            name: "bucketName",
          },
          object: {
            key,
            size: 10,
            eTag: "etag",
          },
        },
      },
    ],
  } as S3Event;
};

describe("resize", () => {
  let awsClientMock: any;

  beforeEach(() => {
    process.env.THUMB_IMAGES_SIZES = "100x100:cover";
  });

  it("Should validate thumb fit", () => {
    expect(() => parseFit("not_exist")).to.throw(Error);
    expect(parseFit("cover")).to.equal("cover");
  });

  it("Should throw error when thumb sizes not provided", () => {
    process.env.THUMB_IMAGES_SIZES = "10";

    expect(getThumbSizes).to.throw(Error);
  });

  it("Should validate thumb sizes", () => {
    process.env.THUMB_IMAGES_SIZES = "100x100:cover";

    expect(getThumbSizes()).to.deep.equal([{ width: 100, height: 100, fit: "cover" }]);
  });

  it("Shouldn't resize file when file has already resized", async () => {
    const getObjectMock = sinon.fake.returns("");
    awsClientMock = { getObject: getObjectMock };

    await resizeImage(createEvent("file.100-100.jpg"), awsClientMock);

    expect(getObjectMock.notCalled).to.be.true;
  });

  it("Should resize file and upload to s3", async () => {
    const getObjectMock = sinon.fake.returns({
      promise() {
        return Promise.resolve({
          Body: Buffer.from(""),
        });
      },
    });
    const putObjectMock = sinon.fake.returns({
      promise() {
        return Promise.resolve();
      },
    });
    const headObjectMock = sinon.fake.returns({
      promise() {
        /* eslint-disable @typescript-eslint/no-throw-literal */
        throw { code: "NotFound" } as AWSError;
      },
    });

    awsClientMock = { getObject: getObjectMock, putObject: putObjectMock, headObject: headObjectMock };

    const resizeObjMock = {
      toBuffer() {
        return Promise.resolve(Buffer.from(""));
      },
    };

    const sharpMock = () => {
      return {
        resize: sinon.fake.returns(resizeObjMock),
        metadata: sinon.fake.returns(Promise.resolve({ format: "jpeg" })),
      };
    };

    await resizeImage(createEvent("file-original.jpg"), awsClientMock, sharpMock as any);
    expect(headObjectMock.calledOnce).to.be.true;
    expect(getObjectMock.calledOnce).to.be.true;
    expect(putObjectMock.calledOnce).to.be.true;
  });
});
