import express from "express";
import { validateRequest } from "@matzapata/common";
import * as AuthController from "../controllers/auth";
import { body } from "express-validator";

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
router.get("/verify/:token", AuthController.verifyEmail);
router.post("/verify/resend", AuthController.resendToken);

//Password RESET
// router.post(
//   "/recover",
//   [body("email").isEmail().withMessage("Enter a valid email address")],
//   validateRequest,
//   Password.recover
// );

// router.get("/reset/:token", [], validateRequest, Password.reset);

// router.post(
//   "/reset/:token",
//   [
//     body("password")
//       .not()
//       .isEmpty()
//       .isLength({ min: 6 })
//       .withMessage("Must be at least 6 chars long"),
//     body("confirmPassword", "Passwords do not match").custom(
//       (value, { req }) => value === req.body.password
//     ),
//   ],
//   validateRequest,
//   Password.resetPassword
// );

export { router as authRouter };
