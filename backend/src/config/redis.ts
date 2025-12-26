import Redis from "ioredis";

let redisClient: Redis | null = null;
let isRedisAvailable = false;

/**
 * Initialize Redis connection
 * Falls back gracefully if Redis is not available
 */
export function initializeRedis(): Redis | null {
    try {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

        redisClient = new Redis(redisUrl, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            connectTimeout: 10000,
        });

        redisClient.on("connect", () => {
            console.log("Redis client connecting...");
        });

        redisClient.on("ready", () => {
            isRedisAvailable = true;
            console.log("Redis client ready");
        });

        redisClient.on("error", (err) => {
            console.error("Redis connection error:", err.message);
            isRedisAvailable = false;
        });

        redisClient.on("close", () => {
            console.log("Redis connection closed");
            isRedisAvailable = false;
        });

        return redisClient;
    } catch (error) {
        console.error("Failed to initialize Redis:", error);
        isRedisAvailable = false;
        return null;
    }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): Redis | null {
    return redisClient;
}

/**
 * Check if Redis is available
 */
export function isRedisConnected(): boolean {
    if (!redisClient) {
        return false;
    }
    // Check both our flag and the client status
    return isRedisAvailable && (redisClient.status === "ready" || redisClient.status === "connect");
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        isRedisAvailable = false;
    }
}

