import express, { Request, Response } from "express";
import { requiresAuth } from "@matzapata/common";

const router = express.Router();

router.get(
  "/api/base/test",
  requiresAuth,
  async (req: Request, res: Response): Promise<Response> => {
    return res.send("OK");
  }
);

export { router as indexOrderRouter };
