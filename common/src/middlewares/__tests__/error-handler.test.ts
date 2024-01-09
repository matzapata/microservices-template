/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { UnauthorizedError } from "../../errors/unauthorized-error";
import { errorHandler } from "../error-handler";
import { StatusCodes } from "http-status-codes";

const logger = jest.fn();
const errorHandlerMiddleware = errorHandler(logger);

describe("error-handler middleware", () => {
  it("should build a response with the error", async () => {
    const error = new UnauthorizedError();
    const req = {} as express.Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    errorHandlerMiddleware(error, req, res as any, next);

    expect(res.send).toHaveBeenCalledWith({
      errors: error.serializeErrors(),
      status: error.statusCode,
    });
    expect(res.status).toHaveBeenCalledWith(error.statusCode);
    expect(next).not.toHaveBeenCalled();
  });

  it("should default to internal server error for all unknown errors", async () => {
    const error = new Error("error message");
    const req = {} as express.Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    errorHandlerMiddleware(error, req, res as any, next);

    expect(res.send).toHaveBeenCalledWith({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: "error message" }],
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call the logger function if provided", async () => {
    const error = new Error("error message");
    const req = {} as express.Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    errorHandlerMiddleware(error, req, res as any, next);

    expect(logger).toHaveBeenCalled();
  });
});
