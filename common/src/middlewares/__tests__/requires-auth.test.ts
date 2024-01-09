/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
import express from "express";
import { requiresAuth } from "../requires-auth";
import { UnauthorizedError } from "../../errors/unauthorized-error";

describe("requires-auth middleware", () => {
  it("should return 401 if no user is logged in", async () => {
    const req = { headers: {} } as express.Request;
    const res = {};
    const next = jest.fn();

    requiresAuth(req, res as any, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError());
  });

  it("should set the jwt payload in req.currentUser", async () => {
    const jwtPayload = { id: "test-id", email: "email@gmail.com" };
    const token = jwt.sign(jwtPayload, process.env.JWT_KEY!);

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as express.Request;
    const res = {};
    const next = jest.fn();

    requiresAuth(req, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(req.currentUser?.email).toEqual(jwtPayload.email);
    expect(req.currentUser?.id).toEqual(jwtPayload.id);
  });
});
