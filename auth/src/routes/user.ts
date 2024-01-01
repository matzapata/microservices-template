import express from "express";
import { requiresAuth, validateRequest } from "@matzapata/common";
import * as UsersController from "../controllers/user";
import { body } from "express-validator";

const router = express.Router();

router.get("/:id", requiresAuth, UsersController.show);
router.put(
  "/:id",
  [
    body("firstName")
      .isLength({ min: 3 })
      .withMessage("You first name is required"),
    body("lastName")
      .isLength({ min: 3 })
      .withMessage("You last name is required"),
  ],
  validateRequest,
  requiresAuth,
  UsersController.update
);

export { router as usersRouter };
