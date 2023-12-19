import { from, logger } from "env-var";

// Log missing env variables
const env = from(process.env, {}, logger);

// Export env variables
export const API_BASE_URL: string = env
  .get("REACT_APP_API_BASE_URL")
  .required()
  .asString();
