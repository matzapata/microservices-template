import express from "express";
import { validateRequest } from "@matzapata/common";
import { body } from "express-validator";
import * as AuthController from "../controllers/auth";
import * as PasswordController from "../controllers/password";

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Enter a valid email address"),
    body("password")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("Must be at least 6 chars long"),
    body("firstName").not().isEmpty().withMessage("You first name is required"),
    body("lastName").not().isEmpty().withMessage("You last name is required"),
  ],
  validateRequest,
  AuthController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email address"),
    body("password").not().isEmpty(),
  ],
  validateRequest,
  AuthController.login
);

router.post(
  "/verify/resend",
  [body("email").isEmail().withMessage("Enter a valid email address")],
  validateRequest,
  AuthController.resendToken
);

router.get("/verify/:token", AuthController.verifyEmail);

router.post(
  "/reset",
  [body("email").isEmail().withMessage("Enter a valid email address")],
  validateRequest,
  PasswordController.requestPasswordReset
);

router.post(
  "/reset/:token",
  [
    body("password")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("Must be at least 6 chars long"),
    body("confirmPassword", "Passwords do not match").custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  validateRequest,
  PasswordController.resetPassword
);

export { router as authRouter };
