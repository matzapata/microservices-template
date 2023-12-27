import request from "supertest";
import { app } from "../../app";
import { StatusCodes } from "http-status-codes";
import { sendEmail } from "../../utils/send-email";
import { User, UserDoc } from "../../models/user";
import { TokenDoc } from "../../models/token";
import jwt from "jsonwebtoken";

const BASE_URL = "/api/users/auth";

jest.mock("../../utils/send-email");

describe("POST /api/users/auth/register", () => {
  it("Should validate request parameters", async () => {
    const res = await request(app)
      .post(BASE_URL + "/register")
      .send({});

    expect(res.body.errors).toStrictEqual([
      { message: "Enter a valid email address", field: "email" },
      { message: "Invalid value", field: "password" },
      { message: "Must be at least 6 chars long", field: "password" },
      { message: "You first name is required", field: "firstName" },
      { message: "You last name is required", field: "lastName" },
    ]);
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
  });

  it("Disallows duplicate emails", async () => {
    await request(app)
      .post(BASE_URL + "/register")
      .send({
        email: "test@gmail.com",
        password: "password",
        firstName: "test",
        lastName: "test",
      });
    const res = await request(app)
      .post(BASE_URL + "/register")
      .send({
        email: "test@gmail.com",
        password: "password",
        firstName: "test2",
        lastName: "test2",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([
      { message: "Email already in use" },
    ]);
  });

  it("Returns 201 on successful registration", async () => {
    const res = await request(app)
      .post(BASE_URL + "/register")
      .send({
        email: "test@gmail.com",
        password: "password",
        firstName: "test",
        lastName: "test",
      });

    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.body).toEqual({
      email: "test@gmail.com",
      firstName: "test",
      lastName: "test",
      isVerified: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      id: expect.any(String),
    });
  });

  it("Sends a verification email on successful registration", async () => {
    const res = await request(app)
      .post(BASE_URL + "/register")
      .send({
        email: "test@gmail.com",
        password: "password",
        firstName: "test",
        lastName: "test",
      });

    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(sendEmail).toHaveBeenCalled();
  });
});

describe("POST /api/users/auth/login", () => {
  it("Should validate request parameters", async () => {
    const res = await request(app)
      .post(BASE_URL + "/login")
      .send({});

    expect(res.body.errors).toStrictEqual([
      { message: "Enter a valid email address", field: "email" },
      { message: "Invalid value", field: "password" },
    ]);
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
  });

  it("Fails if account with such an email doesn't exist", async () => {
    const res = await request(app)
      .post(BASE_URL + "/login")
      .send({
        email: "nonexistant@emial.com",
        password: "password",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([{ message: "Invalid credentials" }]);
  });

  it("Fails when password doesn't match", async () => {
    await createUser("email@gmail.com", "password", "test", "test", true);

    const res = await request(app)
      .post(BASE_URL + "/login")
      .send({
        email: "email@gmail.com",
        password: "wrong-password",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([{ message: "Invalid credentials" }]);
  });

  it("Fails when email is not verified", async () => {
    await createUser("email@gmail.com", "password", "test", "test", false);

    const res = await request(app)
      .post(BASE_URL + "/login")
      .send({
        email: "email@gmail.com",
        password: "password",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([{ message: "Email not verified" }]);
  });

  it("Returns 200 on successful login", async () => {
    await createUser("email@gmail.com", "password", "test", "test", true);

    const res = await request(app)
      .post(BASE_URL + "/login")
      .send({
        email: "email@gmail.com",
        password: "password",
      });

    expect(res.status).toEqual(StatusCodes.OK);

    const token = res.body.token;
    const decodedToken = jwt.verify(token, process.env.JWT_KEY!) as string;

    expect(token).toBeDefined();
    expect(decodedToken).toStrictEqual({
      id: expect.any(String),
      email: "email@gmail.com",
      firstName: "test",
      lastName: "test",
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });
});

describe("GET /api/users/auth/verify/:token", () => {
  it("Fails if token doesn't exist", async () => {
    const res = await request(app).get(
      BASE_URL + "/verify/this-is-a-fake-token"
    );

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([{ message: "Invalid token" }]);
  });

  it("Fails if email is already verified", async () => {
    const { token } = await createUser(
      "email@gmail.com",
      "password",
      "test",
      "test",
      true
    );

    const res = await request(app).get(BASE_URL + "/verify/" + token.token);

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([
      { message: "Email already verified" },
    ]);
  });

  it("Returns 200 and verifies the email if token is valid and email is was not verified yet", async () => {
    const { token } = await createUser(
      "email@gmail.com",
      "password",
      "test",
      "test",
      false
    );

    const res = await request(app).get(BASE_URL + "/verify/" + token.token);

    expect(res.status).toEqual(StatusCodes.OK);
  });
});

async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  isVerified: boolean = false
): Promise<{ user: UserDoc; token: TokenDoc }> {
  const user = User.build({
    email,
    password,
    firstName,
    lastName,
    isVerified,
  });
  await user.save();
  const token = user.generateVerificationToken();
  await token.save();

  return { user, token };
}
