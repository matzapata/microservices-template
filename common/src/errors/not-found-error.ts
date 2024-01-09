import { StatusCodes } from "http-status-codes";
import { CustomError } from "src/errors/custom-error";

export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  constructor(message?: string) {
    super(message ?? "Not found");

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
