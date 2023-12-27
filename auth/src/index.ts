import mongoose from "mongoose";
import { app } from "./app";
import { ENV } from "./env";
import { natsWrapper } from "./nats-wrapper";
import { logger } from "./utils/logger";

const start = async () => {
  try {
    // Initiate NATS client
    await natsWrapper.connect(
      ENV.NATS_CLUSTER_ID,
      ENV.NATS_CLIENT_ID,
      ENV.NATS_URL
    );
    natsWrapper.client.on("close", () => {
      logger.info("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    await mongoose.connect(ENV.MONGO_URI);
  } catch (err) {
    logger.error(err);
  }

  app.listen(3000, () => {
    logger.info("Listening on port 3000...");
  });
};

start();
