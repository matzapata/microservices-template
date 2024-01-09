import { CustomError } from "src/errors/custom-error";
import { StatusCodes } from "http-status-codes";

export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(message?: string) {
    super(message ?? "Bad request");

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
