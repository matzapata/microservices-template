import { cleanEnv, str } from "envalid";

export const ENV = cleanEnv(process.env, {
  JWT_KEY: str(),
});
