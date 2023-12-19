import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@matzapata/common";
import { indexOrderRouter } from "./routes/index";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);
app.use(currentUser);

app.use(indexOrderRouter);

app.all("*", async () => {
  throw new NotFoundError(); // TODO: Create not implemented error
});

app.use(errorHandler);

export { app };
