import request from "supertest";
import { app } from "../../app";

it("GET /api/test", async () => {
  await request(app).get("/api/test").send().expect(200);
});
