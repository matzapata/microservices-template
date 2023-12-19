import { from, logger } from "env-var";

// Log missing env variables
const env = from(process.env, {}, logger);

// Export env variables
export const JWT_KEY: string = env.get("JWT_KEY").required().asString();
export const NATS_CLIENT_ID: string = env
  .get("NATS_CLIENT_ID")
  .required()
  .asString();
export const NATS_URL: string = env.get("NATS_URL").required().asString();
export const NATS_CLUSTER_ID: string = env
  .get("NATS_CLUSTER_ID")
  .required()
  .asString();
