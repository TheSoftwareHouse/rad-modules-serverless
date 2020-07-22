import { expect } from "chai";
import { S3Event } from "aws-lambda";
import { getWatermarkOptions, getWatermarkPosition, watermarkImage } from "./watermark";
import sinon from "sinon";
import fs from "fs";

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

describe("watermark", () => {
  let awsClientMock: any;
  const testImg = fs.readFileSync("./lambdas/watermark/px.png");

  beforeEach(() => {
    process.env.WATERMARK_OPTIONS = "right:bottom:0.1";
    process.env.WATERMARK_FILENAME = "watermark.png";
    process.env.WATERMARK_BUCKET = "mybucket";
  });

  it("should get watermark position", () => {
    process.env.WATERMARK_OPTIONS = "right:bottom:0.1";
    expect(getWatermarkPosition(200, 100, 70, 30, getWatermarkOptions())).to.deep.equals([130, 70]);

    process.env.WATERMARK_OPTIONS = "left:top:0.1";
    expect(getWatermarkPosition(200, 100, 70, 30, getWatermarkOptions())).to.deep.equals([0, 0]);

    process.env.WATERMARK_OPTIONS = "right:top:0.1";
    expect(getWatermarkPosition(200, 100, 70, 30, getWatermarkOptions())).to.deep.equals([130, 0]);

    process.env.WATERMARK_OPTIONS = "left:bottom:0.1";
    expect(getWatermarkPosition(200, 100, 70, 30, getWatermarkOptions())).to.deep.equals([0, 70]);

    process.env.WATERMARK_OPTIONS = "center:middle:0.1";
    expect(getWatermarkPosition(200, 100, 70, 30, getWatermarkOptions())).to.deep.equals([65, 35]);
  });

  it("should parse watermark options", () => {
    process.env.WATERMARK_OPTIONS = "right:bottom:0.1";
    expect(getWatermarkOptions()).to.deep.equals({
      positionX: "right",
      positionY: "bottom",
      opacity: 0.1,
    });

    process.env.WATERMARK_OPTIONS = "center:middle:0.5";
    expect(getWatermarkOptions()).to.deep.equals({
      positionX: "center",
      positionY: "middle",
      opacity: 0.5,
    });
  });

  it("shouldn't get watermark image when image has not '-original' postfix", async () => {
    const getObjectMock = sinon.fake.returns("");
    awsClientMock = { getObject: getObjectMock };

    const event = createEvent("filename.jpg");

    const result = await watermarkImage(event, awsClientMock);

    expect(result).to.be.undefined;
    expect(getObjectMock.notCalled).to.be.true;
  });

  it("should add watermark to image and save in s3", async () => {
    const fileName = "filename-original.jpg";
    const event = createEvent(fileName);
    const getObjectMock = sinon.fake.returns({
      promise: () => {
        return { Body: testImg };
      },
    });
    const putObjectMock = sinon.fake.returns({
      promise: () => {
        return {};
      },
    });
    awsClientMock = { getObject: getObjectMock, putObject: putObjectMock };

    await watermarkImage(event, awsClientMock);

    expect(getObjectMock.callCount).to.be.equal(2);
    expect(putObjectMock.callCount).to.be.equal(1);
  });
});
