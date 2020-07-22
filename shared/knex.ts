import { StaticConnectionConfig } from "knex";
import { config } from "dotenv";

config({ path: "../.env" });

export const client = process.env.DB_TYPE;

export const connection: StaticConnectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_USE_SSL === "true",
  connectionTimeoutMillis: +(process.env.DB_CONNECTION_TIMEOUT_MILLIS ?? 3000),
};
export const migrations = {
  directory: "../migrations",
};
