import { StatusCodes } from "http-status-codes";
import { CustomError } from "src/errors/custom-error";

export class UnauthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor(message?: string) {
    super(message ?? "Unauthorized");

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
