import { app } from "src/app";
import { ENV } from "src/env";
import { natsWrapper } from "src/nats-wrapper";
import { logger } from "src/utils/logger";

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
  } catch (err) {
    logger.error(err);
  }

  app.listen(3000, () => {
    logger.info("Listening on port 3000...");
  });
};

start();
