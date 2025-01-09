import request from "supertest";
import { app } from "src/app";
import { StatusCodes } from "http-status-codes";
import { sendEmail } from "src/lib/send-email";
import { User, UserDoc } from "src/models/user";
import { TokenDoc } from "src/models/token";
import jwt from "jsonwebtoken";

const BASE_URL = "/api/auth";

jest.mock("src/utils/send-email");

describe("POST /api/auth/register", () => {
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

describe("POST /api/auth/login", () => {
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

describe("GET /api/auth/verify/:token", () => {
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

describe("POST /api/auth/resend", () => {
  it("Should validate request parameters", async () => {
    const res = await request(app)
      .post(BASE_URL + "/verify/resend")
      .send({});

    expect(res.body.errors).toStrictEqual([
      { message: "Enter a valid email address", field: "email" },
    ]);
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
  });

  it("Fails if account with such an email doesn't exist", async () => {
    const res = await request(app)
      .post(BASE_URL + "/verify/resend")
      .send({
        email: "new-email@gmail.com",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([{ message: "Email not found" }]);
  });

  it("Fails if email is already verified", async () => {
    await createUser("email@gmail.com", "password", "test", "test", true);

    const res = await request(app)
      .post(BASE_URL + "/verify/resend")
      .send({
        email: "email@gmail.com",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([
      { message: "Email already verified" },
    ]);
  });

  it("Returns 200 and sends a verification email if email is valid and email is was not verified yet", async () => {
    await createUser("email@gmail.com", "password", "test", "test", false);

    const res = await request(app)
      .post(BASE_URL + "/verify/resend")
      .send({
        email: "email@gmail.com",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(sendEmail).toHaveBeenCalled();
  });
});

describe("POST /api/auth/reset", () => {
  it("Should validate request parameters", async () => {
    const res = await request(app)
      .post(BASE_URL + "/reset")
      .send({});

    expect(res.body.errors).toStrictEqual([
      { message: "Enter a valid email address", field: "email" },
    ]);
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
  });

  it("Fails if account with such an email doesn't exist", async () => {
    const res = await request(app)
      .post(BASE_URL + "/reset")
      .send({
        email: "fake-email@gmail.com",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([{ message: "Email not found" }]);
  });

  it("Returns 200 and sends a password reset email if email is valid", async () => {
    await createUser("test@gmail.com", "password", "test", "test", true);

    const res = await request(app)
      .post(BASE_URL + "/reset")
      .send({ email: "test@gmail.com" });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(sendEmail).toHaveBeenCalled();
  });
});

describe("POST /api/auth/reset/:token", () => {
  it("Should validate request parameters", async () => {
    const res = await request(app)
      .post(BASE_URL + "/reset/this-is-a-fake-token")
      .send({});

    expect(res.body.errors).toStrictEqual([
      { message: "Invalid value", field: "password" },
      { message: "Must be at least 6 chars long", field: "password" },
    ]);
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
  });

  it("Fails if token doesn't exist", async () => {
    const res = await request(app)
      .post(BASE_URL + "/reset/this-is-a-fake-token")
      .send({
        password: "password",
        confirmPassword: "password",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([{ message: "Invalid token" }]);
  });

  it("Fails if token is expired", async () => {
    await createUser(
      "test@gmail.com",
      "password",
      "name",
      "surname",
      true,
      "reset-token",
      new Date(Date.now() - 3600000)
    );

    const res = await request(app)
      .post(BASE_URL + "/reset/reset-token")
      .send({
        password: "password",
        confirmPassword: "password",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([{ message: "Invalid token" }]);
  });

  it("Returns 200, resets the password and sends and email if token is valid", async () => {
    await createUser(
      "test@gmail.com",
      "password",
      "name",
      "surname",
      true,
      "reset-token"
    );

    const res = await request(app)
      .post(BASE_URL + "/reset/reset-token")
      .send({
        password: "new-password",
        confirmPassword: "new-password",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(sendEmail).toHaveBeenCalled();

    const user = await User.findOne({ email: "test@gmail.com" });
    expect(await user?.comparePassword("password")).toEqual(false);
    expect(await user?.comparePassword("new-password")).toEqual(true);
  });
});

async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  isVerified: boolean = false,
  resetPasswordToken: string = "reset-token",
  resetPasswordExpires: Date = new Date(Date.now() + 3600000)
): Promise<{ user: UserDoc; token: TokenDoc }> {
  const user = User.build({
    email,
    password,
    firstName,
    lastName,
    isVerified,
    resetPasswordToken,
    resetPasswordExpires,
  });
  await user.save();
  const token = user.generateVerificationToken();
  await token.save();

  return { user, token };
}
