import supertest from "supertest";
import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validateRequest } from "../validate-request";
import { body } from "express-validator";

// Create example app
const app = express();
app.use(express.json());
app.get(
  "/validate-request",
  [body("email").isString()],
  validateRequest,
  (req: Request, res: Response) => {
    res.status(StatusCodes.OK).send(req.currentUser);
  }
);
const request = supertest(app);

describe("validate-request middleware", () => {
  it("should return BAD_REQUEST if the parameters validation fails", async () => {
    const res = await request.get("/validate-request").send();
    console.log;
    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it("should not break endpoint if validations are successful", async () => {
    const res = await request.get("/validate-request").send({ email: "test" });

    expect(res.statusCode).toEqual(StatusCodes.OK);
  });
});
