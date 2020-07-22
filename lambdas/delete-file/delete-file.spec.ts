import { Permission } from "../../shared/interfaces";
import request from "supertest";

describe("delete-file", () => {
  const server = request("http://localhost:1337");

  it("DELETE /dev/files return 204", async () => {
    const fileResponse = await server
      .post("/dev/upload")
      .send({
        fileName: "my-file",
        description: "some file",
        fileType: "jpg",
        permission: Permission.PUBLIC,
      })
      .expect(201);

    return server
      .delete("/dev/files")
      .query({
        key: fileResponse.body.key,
      })
      .expect(204);
  });
});
