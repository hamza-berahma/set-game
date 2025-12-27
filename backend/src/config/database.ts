import { Pool } from "pg";

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

const pool = new Pool({
    ...poolConfig,
    max: parseInt(process.env.DB_MAX_CONNECTIONS || "20"),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
    console.log("Connected to PostgreSQL database: ");
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client ", err);
    process.exit(-1);
});

export default pool;
