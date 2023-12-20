import supertest from "supertest";
import express from "express";
import { UnauthorizedError } from "../../errors/unauthorized-error";
import { errorHandler } from "../error-handler";
import { StatusCodes } from "http-status-codes";

const logger = jest.fn();

// Create example app
const app = express();
app.use(express.json());
app.get("/custom-error", () => {
  throw new UnauthorizedError();
});
app.get("/generic-error", () => {
  throw new Error("error message");
});
app.use(errorHandler(logger));
const request = supertest(app);

describe("error-handler middleware", () => {
  it("should build a response with the error", async () => {
    const error = new UnauthorizedError();
    const res = await request.get("/custom-error").send();

    expect(res.body).toStrictEqual({
      errors: error.serializeErrors(),
      status: error.statusCode,
    });
    expect(res.statusCode).toEqual(error.statusCode);
  });

  it("should default to internal server error for all unknown errors", async () => {
    const res = await request.get("/generic-error").send();

    expect(res.body).toStrictEqual({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: "error message" }],
    });
    expect(res.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it("should call the logger function if provided", async () => {
    await request.get("/generic-error").send();

    expect(logger).toHaveBeenCalled();
  });
});
