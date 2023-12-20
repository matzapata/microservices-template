import jwt from "jsonwebtoken";
import supertest from "supertest";
import express, { Request, Response } from "express";
import { requiresAuth } from "../requires-auth";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../errors/custom-error";

process.env.JWT_KEY = "test-jwt-key";

// Create example app
const app = express();
app.use(express.json());
app.get("/requires-auth", requiresAuth, (req: Request, res: Response) => {
  try {
    res.status(StatusCodes.OK).send(req.currentUser);
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
  }
});
const request = supertest(app);

describe("requires-auth middleware", () => {
  it("should return 401 if no user is logged in", async () => {
    const res = await request.get("/requires-auth").send();

    expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
  });

  it("should set the jwt payload in req.currentUser", async () => {
    const jwtPayload = { id: "test-id", email: "email@gmail.com" };
    const token = jwt.sign(jwtPayload, process.env.JWT_KEY!);

    const res = await request
      .get("/requires-auth")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.statusCode).toEqual(StatusCodes.OK);
    expect(res.body.email).toEqual(jwtPayload.email);
    expect(res.body.id).toEqual(jwtPayload.id);
  });
});
