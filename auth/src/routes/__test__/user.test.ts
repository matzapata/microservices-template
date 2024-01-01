import request from "supertest";
import { app } from "../../app";
import { User, UserDoc } from "../../models/user";
import { TokenDoc } from "../../models/token";
import { StatusCodes } from "http-status-codes";

const BASE_URL = "/api/users";

describe("GET /api/users/:uid", () => {
  it("returns 401 UNAUTHORIZED if user is not authenticated", async () => {
    const { user } = await createUser(
      "email@gmail.com",
      "password",
      "first",
      "last"
    );
    const res = await request(app).get(BASE_URL + `/${user.id}`);

    expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(res.body.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(res.body.errors).toStrictEqual([{ message: "Unauthorized" }]);
  });

  it("returns 401 UNAUTHORIZED if id param doesn't match jwt", async () => {
    const { authToken } = await createUser(
      "email@gmail.com",
      "password",
      "first",
      "last"
    );

    const res = await request(app)
      .get(BASE_URL + `/other-id`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(res.body.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(res.body.errors).toStrictEqual([
      { message: "You are not authorized to view this user" },
    ]);
  });

  it("returns 200 OK with user data if user is authorized", async () => {
    const { user, authToken } = await createUser(
      "email@gmail.com",
      "password",
      "first",
      "last"
    );
    const res = await request(app)
      .get(BASE_URL + `/${user.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.body.email).toEqual("email@gmail.com");
    expect(res.body.firstName).toEqual("first");
    expect(res.body.lastName).toEqual("last");
    expect(res.body.isVerified).toEqual(false);
    expect(res.body.id).toEqual(user.id);
    expect(Object.keys(res.body).length).toEqual(5); // Ensure no extra fields than specified are returned
  });
});

describe("PUT /api/users/:uid", () => {
  it("returns 401 UNAUTHORIZED if user is not authenticated", async () => {
    const { user } = await createUser(
      "email@gmail.com",
      "password",
      "first",
      "last"
    );
    const res = await request(app)
      .put(BASE_URL + `/${user.id}`)
      .send({ firstName: "new-first", lastName: "new-last" });

    expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(res.body.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(res.body.errors).toStrictEqual([{ message: "Unauthorized" }]);
  });

  it("returns 401 UNAUTHORIZED if id param doesn't match jwt", async () => {
    const { authToken, user } = await createUser(
      "email@gmail.com",
      "password",
      "first",
      "last"
    );
    const res = await request(app)
      .put(BASE_URL + `/not-${user.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ firstName: "new-first", lastName: "new-last" });

    expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(res.body.status).toEqual(StatusCodes.UNAUTHORIZED);
    expect(res.body.errors).toStrictEqual([
      { message: "You are not authorized to update this user" },
    ]);
  });

  it("returns 400 BAD REQUEST if params are not provided", async () => {
    const { authToken, user } = await createUser(
      "email@gmail.com",
      "password",
      "first",
      "last"
    );
    const res = await request(app)
      .put(BASE_URL + `/${user.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    console.log("res", res.body);
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.body.errors).toStrictEqual([
      { message: "You first name is required", field: "firstName" },
      { message: "You last name is required", field: "lastName" },
    ]);
  });

  it("Updates the user and returns 200 status with the new user data", async () => {
    const { authToken, user } = await createUser(
      "email@gmail.com",
      "password",
      "first",
      "last"
    );
    const res = await request(app)
      .put(BASE_URL + `/${user.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ firstName: "new-first", lastName: "new-last" });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.body).toStrictEqual({
      id: user.id,
      email: user.email,
      firstName: "new-first",
      lastName: "new-last",
      isVerified: user.isVerified,
    });
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
): Promise<{ user: UserDoc; token: TokenDoc; authToken: string }> {
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
  const authToken = user.generateJWT();

  return { user, token, authToken };
}
