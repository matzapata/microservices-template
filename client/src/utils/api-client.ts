import axios from "axios";
import { API_BASE_URL } from "./env";

export const ApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});
