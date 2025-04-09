import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";
dotenv.config();

const password = process.env.DATABASE_PASSWORD;
const hasPassword = password && password.trim() !== "";

export const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_DATABASE,
  port: process.env.DATABASE_PORT,
  ...(hasPassword && { password })
});
