"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = void 0;
const redis_1 = require("../config/redis");
const GAME_STATE_PREFIX = "game:state:";
const GAME_STATE_TTL = 24 * 60 * 60;
class RedisCacheService {
    async saveGameState(roomId, gameState) {
        try {
            const client = (0, redis_1.getRedisClient)();
            if (!client || !(0, redis_1.isRedisConnected)()) {
                return false;
            }
            const key = `${GAME_STATE_PREFIX}${roomId}`;
            const serialized = JSON.stringify(gameState, (key, value) => {
                if (key === "createdAt" || key === "updatedAt") {
                    return value instanceof Date ? value.toISOString() : value;
                }
                return value;
            });
            await client.setex(key, GAME_STATE_TTL, serialized);
            return true;
        }
        catch {
            return false;
        }
    }
    async getGameState(roomId) {
        try {
            const client = (0, redis_1.getRedisClient)();
            if (!client || !(0, redis_1.isRedisConnected)()) {
                return null;
            }
            const key = `${GAME_STATE_PREFIX}${roomId}`;
            const serialized = await client.get(key);
            if (!serialized) {
                return null;
            }
            const gameState = JSON.parse(serialized);
            gameState.createdAt = new Date(gameState.createdAt);
            gameState.updatedAt = new Date(gameState.updatedAt);
            return gameState;
        }
        catch {
            return null;
        }
    }
    async deleteGameState(roomId) {
        try {
            const client = (0, redis_1.getRedisClient)();
            if (!client || !(0, redis_1.isRedisConnected)()) {
                return false;
            }
            const key = `${GAME_STATE_PREFIX}${roomId}`;
            await client.del(key);
            return true;
        }
        catch {
            return false;
        }
    }
    isAvailable() {
        return (0, redis_1.isRedisConnected)();
    }
}
exports.RedisCacheService = RedisCacheService;
