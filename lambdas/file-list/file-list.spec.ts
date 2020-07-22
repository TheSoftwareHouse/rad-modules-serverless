import { expect } from "chai";
import { File } from "../../shared/interfaces";
import { getFilesList } from "./file-list";
import * as sinon from "sinon";

describe("file-list", () => {
  it("Should get file list with page 1 and limit 25", async () => {
    const files = [
      {
        id: 1,
        fileName: "test.jpg",
        description: "opis",
        bucket: "private",
        status: 1,
        fileType: "jpg",
        permission: "private",
        key: "d4caae6b-ff44-43cd-b2d6-12fe5c216cf4",
        createdAt: "2020-05-11T10:10:17.573Z",
      },
      {
        id: 2,
        fileName: "test2.jpg",
        description: "description",
        bucket: "private",
        status: 1,
        fileType: "jpg",
        permission: "private",
        key: "4d1018ae-420a-46a7-9f32-2d2ca21ed7f7",
        createdAt: "2020-05-11T10:10:18.948Z",
      },
    ];
    const getFilesMock = sinon.fake.returns({
      meta: {
        total: 2,
        page: 1,
        limit: 2,
      },
      files,
    });

    const filesWithCount = await getFilesList({}, getFilesMock);
    expect(filesWithCount.files.map((i: File) => i.id)).to.eql([1, 2]);
    expect(filesWithCount.meta).to.eql({
      total: 2,
      page: 1,
      limit: 2,
    });
  });
});
