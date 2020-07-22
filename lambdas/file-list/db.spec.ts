import { expect } from "chai";
import { getKnexInstance, getFiles } from "./db";
import { Permission, FileFilter } from "../../shared/interfaces";
import MockKnex from "mock-knex";

describe("file list db", () => {
  const db = getKnexInstance({ client: "pg" });
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

  beforeEach(() => {
    MockKnex.mock(db);
  });

  afterEach(() => {
    MockKnex.unmock(db);
  });

  it("Should filter by all fields", async () => {
    const filter: FileFilter = { permission: Permission.PRIVATE, fileName: "file" };
    const tracker = MockKnex.getTracker();
    tracker.install();

    tracker.on("query", (query, step) => {
      [
        function firstQuery() {
          expect(query.sql).to.equal('select * from "files" where "permission" = $1 and "fileName" like $2 limit $3'); // eslint-disable-line @typescript-eslint/quotes
          expect(query.bindings).to.deep.equal(["private", "%file%", 25]);
          query.response(files);
        },
        function secondQuery() {
          expect(query.sql).to.equal('select count(*) from "files" where "permission" = $1 and "fileName" like $2'); // eslint-disable-line @typescript-eslint/quotes
          expect(query.bindings).to.deep.equal(["private", "%file%"]);
          query.response([
            {
              count: 2,
            },
          ]);
        },
      ][step - 1]();
    });

    const result = await getFiles(filter, db);
    expect(result.files.length).to.equal(2);
    tracker.uninstall();
  });

  it("Should filter by file name", async () => {
    const filter: FileFilter = { fileName: "file-name" };
    const tracker = MockKnex.getTracker();
    tracker.install();

    tracker.on("query", (query, step) => {
      [
        function firstQuery() {
          expect(query.sql).to.equal('select * from "files" where "fileName" like $1 limit $2'); // eslint-disable-line @typescript-eslint/quotes
          expect(query.bindings).to.deep.equal(["%file-name%", 25]);
          query.response(files);
        },
        function secondQuery() {
          expect(query.sql).to.equal('select count(*) from "files" where "fileName" like $1'); // eslint-disable-line @typescript-eslint/quotes
          expect(query.bindings).to.deep.equal(["%file-name%"]);
          query.response([
            {
              count: 2,
            },
          ]);
        },
      ][step - 1]();
    });

    const result = await getFiles(filter, db);
    expect(result.files.length).to.equal(2);
    tracker.uninstall();
  });

  it("Should hadle page and limit", async () => {
    const filter: FileFilter = { page: 5, limit: 10 };
    const tracker = MockKnex.getTracker();
    tracker.install();

    tracker.on("query", (query, step) => {
      [
        function firstQuery() {
          expect(query.sql).to.equal('select * from "files" limit $1 offset $2'); // eslint-disable-line @typescript-eslint/quotes
          expect(query.bindings).to.deep.equal([10, 40]);
          query.response(files);
        },
        function secondQuery() {
          expect(query.sql).to.equal('select count(*) from "files"'); // eslint-disable-line @typescript-eslint/quotes
          expect(query.bindings).to.deep.equal([]);
          query.response([
            {
              count: 2,
            },
          ]);
        },
      ][step - 1]();
    });

    const result = await getFiles(filter, db);
    expect(result.files.length).to.equal(2);
    tracker.uninstall();
  });
});
