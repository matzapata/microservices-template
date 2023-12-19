import { StatusCodes } from "http-status-codes";
import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(message?: string) {
    super(message ?? "Error connecting to db");

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
