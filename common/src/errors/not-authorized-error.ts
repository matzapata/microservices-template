import { StatusCodes } from "http-status-codes";
import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor(message?: string) {
    super(message ?? "Not Authorized");

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
