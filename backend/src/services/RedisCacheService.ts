import { getRedisClient, isRedisConnected } from "../config/redis";
import { GameState } from "../types/game";

const GAME_STATE_PREFIX = "game:state:";
const GAME_STATE_TTL = 24 * 60 * 60;

export class RedisCacheService {
    async saveGameState(roomId: string, gameState: GameState): Promise<boolean> {
        try {
            const client = getRedisClient();
            if (!client || !isRedisConnected()) {
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
        } catch {
            return false;
        }
    }

    async getGameState(roomId: string): Promise<GameState | null> {
        try {
            const client = getRedisClient();
            if (!client || !isRedisConnected()) {
                return null;
            }

            const key = `${GAME_STATE_PREFIX}${roomId}`;
            const serialized = await client.get(key);

            if (!serialized) {
                return null;
            }

            const gameState = JSON.parse(serialized) as GameState;
            
            gameState.createdAt = new Date(gameState.createdAt);
            gameState.updatedAt = new Date(gameState.updatedAt);

            return gameState;
        } catch {
            return null;
        }
    }

    async deleteGameState(roomId: string): Promise<boolean> {
        try {
            const client = getRedisClient();
            if (!client || !isRedisConnected()) {
                return false;
            }

            const key = `${GAME_STATE_PREFIX}${roomId}`;
            await client.del(key);
            return true;
        } catch {
            return false;
        }
    }

    isAvailable(): boolean {
        return isRedisConnected();
    }
}

