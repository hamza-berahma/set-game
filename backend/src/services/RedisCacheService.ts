import { getRedisClient, isRedisConnected } from "../config/redis";
import { GameState } from "../types/game";

const GAME_STATE_PREFIX = "game:state:";
const GAME_STATE_TTL = 24 * 60 * 60; // 24 hours in seconds

/**
 * Redis Cache Service for game state management
 * Provides fallback to in-memory storage if Redis is unavailable
 */
export class RedisCacheService {
    /**
     * Save game state to Redis with TTL
     */
    async saveGameState(roomId: string, gameState: GameState): Promise<boolean> {
        try {
            const client = getRedisClient();
            if (!client || !isRedisConnected()) {
                // Don't spam logs - Redis connection warning is already handled in redis.ts
                return false;
            }

            const key = `${GAME_STATE_PREFIX}${roomId}`;
            const serialized = JSON.stringify(gameState, (key, value) => {
                // Convert Date objects to ISO strings for serialization
                if (key === "createdAt" || key === "updatedAt") {
                    return value instanceof Date ? value.toISOString() : value;
                }
                return value;
            });

            await client.setex(key, GAME_STATE_TTL, serialized);
            // Only log successful cache operations in debug mode, not in normal operation
            return true;
        } catch (error) {
            // Errors are already handled by the connection layer, just return false
            return false;
        }
    }

    /**
     * Retrieve game state from Redis
     */
    async getGameState(roomId: string): Promise<GameState | null> {
        try {
            const client = getRedisClient();
            if (!client || !isRedisConnected()) {
                // Silently return null - Redis unavailable is already logged
                return null;
            }

            const key = `${GAME_STATE_PREFIX}${roomId}`;
            const serialized = await client.get(key);

            if (!serialized) {
                return null;
            }

            const gameState = JSON.parse(serialized) as GameState;
            
            // Restore Date objects from ISO strings
            gameState.createdAt = new Date(gameState.createdAt);
            gameState.updatedAt = new Date(gameState.updatedAt);

            return gameState;
        } catch (error) {
            // Errors are already handled by the connection layer
            return null;
        }
    }

    /**
     * Delete game state from Redis
     */
    async deleteGameState(roomId: string): Promise<boolean> {
        try {
            const client = getRedisClient();
            if (!client || !isRedisConnected()) {
                // Silently return false - Redis unavailable is already logged
                return false;
            }

            const key = `${GAME_STATE_PREFIX}${roomId}`;
            await client.del(key);
            // Don't log successful deletions in normal operation
            return true;
        } catch (error) {
            // Errors are already handled by the connection layer
            return false;
        }
    }

    /**
     * Check if Redis is available
     */
    isAvailable(): boolean {
        return isRedisConnected();
    }
}

