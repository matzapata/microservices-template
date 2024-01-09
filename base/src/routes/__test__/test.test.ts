import request from "supertest";
import { app } from "src/app";

it("GET /api/base/test", async () => {
  await request(app).get("/api/base/test?id=123").send().expect(200);
});
