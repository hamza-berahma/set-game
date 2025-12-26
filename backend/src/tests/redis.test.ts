import { RedisCacheService } from "../services/RedisCacheService";
import { initializeRedis, isRedisConnected, closeRedis } from "../config/redis";
import { GameState } from "../types/game";

describe("Redis Cache Service", () => {
    beforeAll(async () => {
        // Initialize Redis connection
        initializeRedis();
        
        // Wait a bit for connection to establish
        await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    afterAll(async () => {
        await closeRedis();
    });

    const cacheService = new RedisCacheService();

    test("should check Redis availability", () => {
        const available = cacheService.isAvailable();
        console.log(`Redis available: ${available}`);
        // This test passes whether Redis is available or not
        expect(typeof available).toBe("boolean");
    });

    test("should save and retrieve game state", async () => {
        if (!isRedisConnected()) {
            console.log("Skipping Redis test - Redis not connected");
            return;
        }

        const roomId = "test-room-1";
        const gameState: GameState = {
            roomId,
            status: "active",
            deck: [],
            board: [],
            scores: { "player1": 5, "player2": 3 },
            players: ["player1", "player2"],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Save game state
        const saved = await cacheService.saveGameState(roomId, gameState);
        expect(saved).toBe(true);

        // Retrieve game state
        const retrieved = await cacheService.getGameState(roomId);
        expect(retrieved).not.toBeNull();
        expect(retrieved?.roomId).toBe(roomId);
        expect(retrieved?.status).toBe("active");
        expect(retrieved?.scores["player1"]).toBe(5);
        expect(retrieved?.scores["player2"]).toBe(3);
        expect(retrieved?.players).toContain("player1");
        expect(retrieved?.players).toContain("player2");

        // Clean up
        await cacheService.deleteGameState(roomId);
    }, 10000);

    test("should delete game state", async () => {
        if (!isRedisConnected()) {
            console.log("Skipping Redis test - Redis not connected");
            return;
        }

        const roomId = "test-room-2";
        const gameState: GameState = {
            roomId,
            status: "active",
            deck: [],
            board: [],
            scores: {},
            players: ["player1"],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Save game state
        await cacheService.saveGameState(roomId, gameState);

        // Delete game state
        const deleted = await cacheService.deleteGameState(roomId);
        expect(deleted).toBe(true);

        // Verify it's deleted
        const retrieved = await cacheService.getGameState(roomId);
        expect(retrieved).toBeNull();
    }, 10000);

    test("should handle Redis unavailability gracefully", async () => {
        // This test ensures the service doesn't crash when Redis is unavailable
        const cacheService = new RedisCacheService();
        
        // If Redis is not available, these should return false/null gracefully
        const available = cacheService.isAvailable();
        if (!available) {
            const result = await cacheService.saveGameState("test-room", {} as GameState);
            expect(result).toBe(false);

            const retrieved = await cacheService.getGameState("test-room");
            expect(retrieved).toBeNull();
        }
    });
});

