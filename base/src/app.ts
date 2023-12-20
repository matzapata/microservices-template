import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotImplementedError } from "@matzapata/common";
import { indexOrderRouter } from "./routes/index";
import { logger } from "./utils/logger";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use(indexOrderRouter);

app.all("*", async () => {
  throw new NotImplementedError();
});

app.use(errorHandler(logger.error));

export { app };
