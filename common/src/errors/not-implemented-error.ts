import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class NotImplementedError extends CustomError {
  statusCode = StatusCodes.NOT_IMPLEMENTED;

  constructor(message?: string) {
    super(message ?? "Not implemented");

    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
