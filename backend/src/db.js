import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// Pool = skup spremnih konekcija koje se reuse-uju.
// Bolje nego otvarati novu konekciju na svaki query.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});