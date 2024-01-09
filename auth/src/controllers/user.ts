import { NotFoundError, UnauthorizedError } from "@matzapata/common";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "src/models/user";

export const show = async (req: Request, res: Response): Promise<Response> => {
  if (req.currentUser?.id !== req.params.id) {
    throw new UnauthorizedError("You are not authorized to view this user");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");

  return res.status(StatusCodes.OK).send({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
  });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.currentUser?.id !== req.params.id) {
    throw new UnauthorizedError("You are not authorized to update this user");
  }

  const { firstName, lastName } = req.body as {
    firstName?: string;
    lastName?: string;
  };

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");

  // Update user
  user.firstName = firstName ?? user.firstName;
  user.lastName = lastName ?? user.lastName;
  await user.save();

  return res.status(StatusCodes.OK).send({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
  });
};
