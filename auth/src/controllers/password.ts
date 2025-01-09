import { Request, Response } from "express";
import { User } from "src/models/user";
import { BadRequestError } from "@matzapata/common";
import { ENV } from "src/env";
import { sendEmail } from "src/lib/send-email";
import { StatusCodes } from "http-status-codes";

// @route POST /auth/reset
// @desc Recover Password - Generates token and sends password reset email
// @access Public
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const email = req.body.email.toLowerCase() as string;

  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError("Email not found");

  user.generatePasswordReset();
  await user.save();

  await sendEmail({
    from: ENV.FROM_EMAIL,
    to: user.email,
    subject: "Password change request",
    html: `<p>Hi ${user.firstName}</p>
    <p>Please click on the following <a href="${
      "http://" + ENV.HOST + "/api/auth/reset/" + user.resetPasswordToken // TODO: Update link
    }">link</a> to reset your password.</p> 
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
  });

  return res.status(StatusCodes.OK).send("Email sent");
};

// @route POST /auth/reset/:token
// @desc Reset Password
// @access Public
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token = req.params.token as string;
  const newPassword = req.body.password as string;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) throw new BadRequestError("Invalid token");

  //Set the new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.isVerified = true;
  await user.save();

  await sendEmail({
    to: user.email,
    from: ENV.FROM_EMAIL,
    subject: "Your password has been changed",
    html: `<p>Hi ${user.firstName}</p><p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`,
  });

  return res.status(StatusCodes.OK).send("Password changed successfully");
};
