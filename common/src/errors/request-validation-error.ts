import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class RequestValidationError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      if (err.type === "field") {
        return { message: err.msg, field: err.path };
      }
      return { message: err.msg };
    });
  }
}
