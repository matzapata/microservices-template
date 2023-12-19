import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL } from "./env";

const start = async () => {
  try {
    // Initiate NATS client
    await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL);
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    // TODO: Initiate listeners
    // TODO: Initiate DB connection
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!!!!!");
  });
};

start();
