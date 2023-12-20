import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { ENV } from "../env";

interface UserPayload {
  id: string;
  email: string;
}

declare module "Express" {
  interface Request {
    currentUser?: UserPayload | null;
  }
}

export const requiresAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    throw new UnauthorizedError();
  }

  try {
    const authToken = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(authToken, ENV.JWT_KEY!) as UserPayload;

    req.currentUser = payload;
  } catch (err) {
    req.currentUser = null;
    throw new UnauthorizedError();
  }

  return next();
};
