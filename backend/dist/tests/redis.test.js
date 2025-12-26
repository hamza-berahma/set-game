"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RedisCacheService_1 = require("../services/RedisCacheService");
const redis_1 = require("../config/redis");
describe("Redis Cache Service", () => {
    beforeAll(async () => {
        // Initialize Redis connection
        (0, redis_1.initializeRedis)();
        // Wait a bit for connection to establish
        await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    afterAll(async () => {
        await (0, redis_1.closeRedis)();
    });
    const cacheService = new RedisCacheService_1.RedisCacheService();
    test("should check Redis availability", () => {
        const available = cacheService.isAvailable();
        console.log(`Redis available: ${available}`);
        // This test passes whether Redis is available or not
        expect(typeof available).toBe("boolean");
    });
    test("should save and retrieve game state", async () => {
        if (!(0, redis_1.isRedisConnected)()) {
            console.log("Skipping Redis test - Redis not connected");
            return;
        }
        const roomId = "test-room-1";
        const gameState = {
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
        if (!(0, redis_1.isRedisConnected)()) {
            console.log("Skipping Redis test - Redis not connected");
            return;
        }
        const roomId = "test-room-2";
        const gameState = {
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
        const cacheService = new RedisCacheService_1.RedisCacheService();
        // If Redis is not available, these should return false/null gracefully
        const available = cacheService.isAvailable();
        if (!available) {
            const result = await cacheService.saveGameState("test-room", {});
            expect(result).toBe(false);
            const retrieved = await cacheService.getGameState("test-room");
            expect(retrieved).toBeNull();
        }
    });
});
