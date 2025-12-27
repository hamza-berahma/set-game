/**
 * Test utilities for mocking database and Redis
 */

import { Pool } from "pg";
import { Card, GameState } from "../types/game";

/**
 * Mock database pool for testing
 */
export function createMockPool() {
    const mockQuery = jest.fn();
    const mockPool = {
        query: mockQuery,
        connect: jest.fn(),
        end: jest.fn(),
    } as unknown as Pool;

    return { mockPool, mockQuery };
}

/**
 * Mock Redis client for testing
 */
export function createMockRedisClient() {
    const store = new Map<string, string>();
    
    const mockClient = {
        get: jest.fn(async (key: string) => store.get(key) || null),
        setex: jest.fn(async (key: string, ttl: number, value: string) => {
            store.set(key, value);
            return "OK";
        }),
        del: jest.fn(async (key: string) => {
            store.delete(key);
            return 1;
        }),
        exists: jest.fn(async (key: string) => (store.has(key) ? 1 : 0)),
        ping: jest.fn(async () => "PONG"),
    };

    return { mockClient, store };
}

/**
 * Create a mock game state for testing
 */
export function createMockGameState(overrides?: Partial<GameState>): GameState {
    const deck: Card[] = [
        { id: "1-diamond-solid-red", number: 1 as const, shape: "diamond" as const, shading: "solid" as const, color: "red" as const },
        { id: "2-diamond-solid-red", number: 2 as const, shape: "diamond" as const, shading: "solid" as const, color: "red" as const },
    ];

    const board: Card[] = [
        { id: "1-diamond-solid-red", number: 1 as const, shape: "diamond" as const, shading: "solid" as const, color: "red" as const },
        { id: "2-diamond-solid-red", number: 2 as const, shape: "diamond" as const, shading: "solid" as const, color: "red" as const },
        { id: "3-diamond-solid-red", number: 3 as const, shape: "diamond" as const, shading: "solid" as const, color: "red" as const },
    ];

    return {
        roomId: "test-room",
        status: "active",
        deck,
        board,
        scores: { "player1": 0 },
        players: ["player1"],
        createdAt: new Date(),
        updatedAt: new Date(),
        sequenceNumber: 0,
        ...overrides,
    };
}

/**
 * Create mock cards for testing
 */
export function createMockCards(): Card[] {
    return [
        { id: "1-diamond-solid-red", number: 1 as const, shape: "diamond" as const, shading: "solid" as const, color: "red" as const },
        { id: "2-diamond-solid-red", number: 2 as const, shape: "diamond" as const, shading: "solid" as const, color: "red" as const },
        { id: "3-diamond-solid-red", number: 3 as const, shape: "diamond" as const, shading: "solid" as const, color: "red" as const },
        { id: "1-oval-striped-green", number: 1 as const, shape: "oval" as const, shading: "striped" as const, color: "green" as const },
        { id: "1-squiggle-open-purple", number: 1 as const, shape: "squiggle" as const, shading: "open" as const, color: "purple" as const },
    ];
}

