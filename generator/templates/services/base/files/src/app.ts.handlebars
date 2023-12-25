import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotImplementedError } from "@matzapata/common";
import { testRouter } from "./routes/test";
import { logger } from "./utils/logger";
import morgan from "morgan";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length]", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// TODO: This depends on ingress controller
app.use("/api/base", testRouter);

app.all("*", async () => {
  throw new NotImplementedError();
});

app.use(errorHandler(logger.error));

export { app };
