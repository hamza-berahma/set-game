"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const databaseUrl = process.env.DATABASE_URL;
const poolConfig = databaseUrl
    ? { connectionString: databaseUrl }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "setgame",
        user: process.env.DB_USER || "setgame",
        password: process.env.DB_PASSWORD || "yourpassword",
    };
const pool = new pg_1.Pool({
    ...poolConfig,
    max: parseInt(process.env.DB_MAX_CONNECTIONS || "20"),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased to 10s for Railway
    ssl: process.env.NODE_ENV === 'production' && databaseUrl ? { rejectUnauthorized: false } : false,
});
// Test database connection on startup (non-blocking)
pool.query("SELECT 1")
    .then(() => {
    console.log("✓ Database connection successful");
})
    .catch((err) => {
    console.error("✗ Database connection failed:", err.message);
    console.error("  This is non-fatal - server will continue but database operations may fail");
    console.error("  Ensure DATABASE_URL is set correctly in Railway");
});
pool.on("connect", () => {
    console.log("Connected to PostgreSQL database: ");
});
pool.on("error", (err) => {
    console.error("Unexpected error on idle client ", err);
    // Don't exit - log the error and let the connection pool handle reconnection
    // The server should continue running even if there are database connection issues
});
exports.default = pool;
