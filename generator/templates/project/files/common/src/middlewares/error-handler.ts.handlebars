import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/custom-error";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (logger?: (...params: unknown[]) => unknown) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (logger) logger(err.message);

    if (err instanceof CustomError) {
      res.status(err.statusCode).send({
        status: err.statusCode,
        errors: err.serializeErrors(),
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        errors: [{ message: err.message ?? "Something went wrong" }],
      });
    }

    next();
  };
};
