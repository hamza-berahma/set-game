"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
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
exports.default = pool;
