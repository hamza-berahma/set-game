import Redis from "ioredis";

let redisClient: Redis | null = null;
let isRedisAvailable = false;
let hasLoggedConnectionWarning = false; // Track if we've already logged the connection warning

/**
 * Initialize Redis connection
 * Falls back gracefully if Redis is not available
 */
export function initializeRedis(): Redis | null {
    try {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

        redisClient = new Redis(redisUrl, {
            retryStrategy: () => {
                // Don't retry - fail fast to avoid AggregateError
                return null;
            },
            maxRetriesPerRequest: null, // Disable request retries
            enableReadyCheck: false, // Disable ready check to avoid extra connection attempts
            connectTimeout: 2000, // Short timeout
            lazyConnect: false, // Connect immediately but fail fast
            enableOfflineQueue: false, // Don't queue commands when offline
        });

        redisClient.on("connect", () => {
            console.log("Redis client connecting...");
            hasLoggedConnectionWarning = false; // Reset on successful connection
        });

        redisClient.on("ready", () => {
            isRedisAvailable = true;
            hasLoggedConnectionWarning = false;
            console.log("Redis client ready");
        });

        redisClient.on("error", (err) => {
            // Suppress all connection-related errors after first warning
            if (!hasLoggedConnectionWarning) {
                const errMsg = err?.message || String(err) || "";
                const errName = err?.name || "";
                
                // Handle AggregateError (multiple connection failures)
                if (errName === "AggregateError" || errMsg === "AggregateError") {
                    console.warn("Redis not available - falling back to in-memory storage. To use Redis: sudo docker-compose -f infrastructure/docker-compose.yml up -d redis");
                } else if (errMsg.includes("ECONNREFUSED") || 
                    errMsg.includes("connect") || 
                    errMsg.includes("ENOTFOUND") ||
                    errMsg.includes("Connection") ||
                    errMsg === "" ||
                    errMsg.includes("All connection attempts failed")) {
                    console.warn("Redis not available - falling back to in-memory storage. To use Redis: sudo docker-compose -f infrastructure/docker-compose.yml up -d redis");
                } else {
                    // Log unexpected errors (but only once)
                    console.error("Redis error:", errMsg || errName);
                }
                hasLoggedConnectionWarning = true;
            }
            // Silently handle subsequent errors
            isRedisAvailable = false;
        });

        redisClient.on("close", () => {
            // Don't log close events - they're normal when Redis isn't running
            isRedisAvailable = false;
        });

        // Suppress the default error handler that might log to console
        redisClient.on("end", () => {
            isRedisAvailable = false;
        });

        return redisClient;
    } catch (error) {
        if (!hasLoggedConnectionWarning) {
            console.warn("Redis initialization failed - falling back to in-memory storage");
            hasLoggedConnectionWarning = true;
        }
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

