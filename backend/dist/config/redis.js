"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeRedis = initializeRedis;
exports.getRedisClient = getRedisClient;
exports.isRedisConnected = isRedisConnected;
exports.closeRedis = closeRedis;
const ioredis_1 = __importDefault(require("ioredis"));
let redisClient = null;
let isRedisAvailable = false;
let hasLoggedConnectionWarning = false;
function initializeRedis() {
    try {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
        redisClient = new ioredis_1.default(redisUrl, {
            retryStrategy: (times) => {
                // Retry up to 3 times with exponential backoff
                if (times > 3) {
                    return null; // Stop retrying
                }
                return Math.min(times * 200, 2000); // 200ms, 400ms, 600ms
            },
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            connectTimeout: 5000, // Increased to 5s for Railway
            lazyConnect: false,
            enableOfflineQueue: false,
        });
        redisClient.on("connect", () => {
            console.log("Redis client connecting...");
            hasLoggedConnectionWarning = false;
        });
        redisClient.on("ready", () => {
            isRedisAvailable = true;
            hasLoggedConnectionWarning = false;
            console.log("Redis client ready");
        });
        redisClient.on("error", (err) => {
            if (!hasLoggedConnectionWarning) {
                const errMsg = err?.message || String(err) || "";
                const errName = err?.name || "";
                if (errName === "AggregateError" || errMsg === "AggregateError") {
                    console.warn("Redis not available - falling back to in-memory storage");
                    console.warn("To enable Redis: Add Redis service in Railway and link REDIS_URL to backend");
                }
                else if (errMsg.includes("ECONNREFUSED") ||
                    errMsg.includes("connect") ||
                    errMsg.includes("ENOTFOUND") ||
                    errMsg.includes("Connection") ||
                    errMsg === "" ||
                    errMsg.includes("All connection attempts failed")) {
                    console.warn("Redis not available - falling back to in-memory storage");
                    console.warn("To enable Redis: Add Redis service in Railway and link REDIS_URL to backend");
                }
                else {
                    console.error("Redis error:", errMsg || errName);
                }
                hasLoggedConnectionWarning = true;
            }
            isRedisAvailable = false;
        });
        redisClient.on("close", () => {
            isRedisAvailable = false;
        });
        redisClient.on("end", () => {
            isRedisAvailable = false;
        });
        return redisClient;
    }
    catch {
        if (!hasLoggedConnectionWarning) {
            console.warn("Redis initialization failed - falling back to in-memory storage");
            hasLoggedConnectionWarning = true;
        }
        isRedisAvailable = false;
        return null;
    }
}
function getRedisClient() {
    return redisClient;
}
function isRedisConnected() {
    if (!redisClient) {
        return false;
    }
    return isRedisAvailable && (redisClient.status === "ready" || redisClient.status === "connect");
}
async function closeRedis() {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        isRedisAvailable = false;
    }
}
