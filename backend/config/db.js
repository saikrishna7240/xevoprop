const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (error) => {
  console.error(
    "PostgreSQL pool error:",
    error.message
  );
});

const initializeDatabase = async () => {
  try {
    console.log("Testing PostgreSQL connection...");

    const result = await pool.query(
      "SELECT NOW() AS current_time"
    );

    console.log(
      "PostgreSQL connection successful:",
      result.rows[0]
    );

    /*
      Keep the rest of your CREATE TABLE
      queries here.
    */

  } catch (error) {
    console.error(
      "Database initialization error:",
      error
    );

    throw error;
  }
};

module.exports = {
  pool,
  initializeDatabase,
};