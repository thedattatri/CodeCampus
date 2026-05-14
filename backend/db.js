// db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ FATAL ERROR: DATABASE_URL is not set in environment variables.");
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";
console.log(`🔹 Starting DB connection in ${isProduction ? "production" : "development"} mode...`);

// Create a Pool with SSL (required by Render)
export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: isProduction ? {
    rejectUnauthorized: false, // ✅ Important for Render
  } : false, // No SSL in development
  max: 10, // optional: max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Attempt initial connection
const connectWithRetry = async () => {
  try {
    await pool.connect();
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err);
    console.log("⏱ Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
  }
};

connectWithRetry();

// Optional: log queries for debugging
// pool.on('connect', () => console.log('🔹 New DB connection'));
// pool.on('error', (err) => console.error('❌ Unexpected DB error', err));
