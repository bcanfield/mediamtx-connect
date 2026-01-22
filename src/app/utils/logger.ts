import pino, { Logger } from "pino";

export function log(): Logger {
  return pino();
}
