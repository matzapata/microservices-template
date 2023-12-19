import { NATS_CLIENT_ID, NATS_CLUSTER_ID, NATS_URL } from "./env";
import { natsWrapper } from "./nats-wrapper";
// import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  try {
    await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL);
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    // TODO: Initiate listeners
    // new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
