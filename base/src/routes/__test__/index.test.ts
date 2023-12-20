import request from "supertest";
import { app } from "../../app";

it("GET /api/base/test", async () => {
  await request(app).get("/api/base/test").send().expect(200);
});
