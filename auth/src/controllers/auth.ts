import { Request, Response } from "express";
import { User, UserDoc } from "../models/user";
import { Token } from "../models/token";
import { sendEmail } from "../utils/send-email";
import { ENV } from "../env";
import { BadRequestError } from "@matzapata/common";
import { StatusCodes } from "http-status-codes";

// POST /register Register a user
export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const email = req.body.email.toLowerCase() as string;

  const user = await User.findOne({ email });
  if (user) throw new BadRequestError("Email already in use");

  const newUser = User.build({
    email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  await newUser.save();

  await sendVerificationEmail(newUser);

  return res.status(StatusCodes.CREATED).send(newUser);
};

// POST /login Login user and return JWT token
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError("Invalid credentials");

  if (!(await user.comparePassword(password)))
    throw new BadRequestError("Invalid credentials");

  if (!user.isVerified) throw new BadRequestError("Email not verified");

  const token = user.generateJWT();
  return res.status(StatusCodes.OK).send({ token });
};

// GET api/verify/:token - Verify token
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token = await Token.findOne({ token: req.params.token });
  if (!token) throw new BadRequestError("Invalid token");

  const user = await User.findOne({ _id: token.userId });
  if (!user) throw new BadRequestError("Invalid token");

  if (user.isVerified) throw new BadRequestError("Email already verified");
  user.isVerified = true;
  await user.save();

  return res.status(StatusCodes.OK).send("Email verified");
};

// POST api/resend - Resend Verification Token
export const resendToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const email = req.body.email.toLowerCase() as string;

  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError("Email not found");

  if (user.isVerified) throw new BadRequestError("Email already verified");

  await sendVerificationEmail(user);

  return res.status(StatusCodes.OK).send("Verification email sent");
};

async function sendVerificationEmail(user: UserDoc): Promise<void> {
  const token = user.generateVerificationToken();
  await token.save();

  const subject = "Account Verification Token";
  const to = user.email;
  const from = ENV.FROM_EMAIL;
  const link = "http://" + ENV.HOST + "/api/auth/verify/" + token.token;
  const html = `<p>Hi ${user.firstName}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
            <br><p>If you did not request this, please ignore this email.</p>`;

  await sendEmail({ to, from, subject, html });
}
