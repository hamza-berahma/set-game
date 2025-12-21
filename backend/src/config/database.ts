import { Pool } from "pg";

const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "setgame",
    user: "setgame",
    password: "yourpassword",
    max: 20,
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
