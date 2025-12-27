import { GameService } from "../services/GameService";
import { createMockGameState } from "./testUtils";
import { Card } from "../types/game";

// Mock dependencies
jest.mock("../services/RedisCacheService");
jest.mock("../repositories/GameRoomRepository");
jest.mock("../repositories/MatchRepository");
jest.mock("../repositories/GameStateRepository");
jest.mock("../repositories/MoveRepository");
jest.mock("../repositories/MatchResultRepository");
jest.mock("../repositories/RoomParticipantRepository");

describe("GameService", () => {
    let gameService: GameService;

    beforeEach(() => {
        gameService = new GameService();
        jest.clearAllMocks();
    });

    describe("createGame", () => {
        it("should create a game with proper state", async () => {
            const roomId = "test-room";
            const playerIds = ["player1", "player2"];

            const gameState = await gameService.createGame(roomId, playerIds);

            expect(gameState).toBeDefined();
            expect(gameState.roomId).toBe(roomId);
            expect(gameState.status).toBe("active");
            expect(gameState.board.length).toBe(12);
            expect(gameState.deck.length).toBe(69); // 81 - 12 = 69
            expect(gameState.players).toEqual(playerIds);
            expect(gameState.scores["player1"]).toBe(0);
            expect(gameState.scores["player2"]).toBe(0);
        });

        it("should initialize scores for all players", async () => {
            const roomId = "test-room";
            const playerIds = ["player1", "player2", "player3"];

            const gameState = await gameService.createGame(roomId, playerIds);

            expect(gameState.scores["player1"]).toBe(0);
            expect(gameState.scores["player2"]).toBe(0);
            expect(gameState.scores["player3"]).toBe(0);
        });
    });

    describe("processCardSelection", () => {
        it("should return error if game not found", async () => {
            const result = await gameService.processCardSelection(
                "non-existent-room",
                "player1",
                ["card1", "card2", "card3"]
            );

            expect(result.success).toBe(false);
            expect(result.message).toBe("Game not found");
        });

        it("should return error if game not active", async () => {
            const roomId = "test-room";
            const gameState = createMockGameState({ status: "finished" });
            
            // Mock getGame to return finished game
            jest.spyOn(gameService, "getGame").mockResolvedValue(gameState);

            const result = await gameService.processCardSelection(
                roomId,
                "player1",
                ["card1", "card2", "card3"]
            );

            expect(result.success).toBe(false);
            expect(result.message).toBe("Game not active");
        });

        it("should return error if not exactly 3 cards selected", async () => {
            const roomId = "test-room";
            const gameState = createMockGameState();
            
            jest.spyOn(gameService, "getGame").mockResolvedValue(gameState);

            const result = await gameService.processCardSelection(
                roomId,
                "player1",
                ["card1", "card2"] // Only 2 cards
            );

            expect(result.success).toBe(false);
            expect(result.message).toBe("Must select exactly 3 cards");
        });

        it("should return error if cards not on board", async () => {
            const roomId = "test-room";
            const gameState = createMockGameState();
            
            jest.spyOn(gameService, "getGame").mockResolvedValue(gameState);

            const result = await gameService.processCardSelection(
                roomId,
                "player1",
                ["non-existent-card1", "non-existent-card2", "non-existent-card3"]
            );

            expect(result.success).toBe(false);
            expect(result.message).toContain("not on board");
        });

        it("should return error for invalid SET", async () => {
            const roomId = "test-room";
            const gameState = createMockGameState();
            
            // Create invalid SET (two same, one different number)
            const invalidCards: Card[] = [
                { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
                { id: "2", number: 1, shape: "diamond", shading: "solid", color: "red" },
                { id: "3", number: 2, shape: "diamond", shading: "solid", color: "red" },
            ];
            
            gameState.board = invalidCards;
            jest.spyOn(gameService, "getGame").mockResolvedValue(gameState);

            const result = await gameService.processCardSelection(
                roomId,
                "player1",
                ["1", "2", "3"]
            );

            expect(result.success).toBe(false);
            expect(result.message).toBe("Selected cards do not form a valid set");
        });

        it("should process valid SET and increment score", async () => {
            const roomId = "test-room";
            const gameState = createMockGameState();
            
            // Create valid SET (all same attributes)
            const validCards: Card[] = [
                { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
                { id: "2", number: 2, shape: "diamond", shading: "solid", color: "red" },
                { id: "3", number: 3, shape: "diamond", shading: "solid", color: "red" },
            ];
            
            gameState.board = validCards;
            gameState.deck = [
                { id: "4", number: 1, shape: "oval", shading: "solid", color: "green" },
                { id: "5", number: 2, shape: "oval", shading: "solid", color: "green" },
            ];
            
            jest.spyOn(gameService, "getGame").mockResolvedValue(gameState);
            jest.spyOn(gameService, "updateGameState").mockResolvedValue();

            const result = await gameService.processCardSelection(
                roomId,
                "player1",
                ["1", "2", "3"]
            );

            expect(result.success).toBe(true);
            expect(result.score).toBe(1);
            expect(result.message).toContain("Valid SET");
        });

        it("should remove cards from board and replenish", async () => {
            const roomId = "test-room";
            const gameState = createMockGameState();
            
            const validCards: Card[] = [
                { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
                { id: "2", number: 2, shape: "diamond", shading: "solid", color: "red" },
                { id: "3", number: 3, shape: "diamond", shading: "solid", color: "red" },
            ];
            
            gameState.board = validCards;
            gameState.deck = [
                { id: "4", number: 1, shape: "oval", shading: "solid", color: "green" },
            ];
            
            jest.spyOn(gameService, "getGame").mockResolvedValue(gameState);
            jest.spyOn(gameService, "updateGameState").mockResolvedValue();

            const result = await gameService.processCardSelection(
                roomId,
                "player1",
                ["1", "2", "3"]
            );

            expect(result.success).toBe(true);
            expect(result.newBoard).toBeDefined();
            expect(result.newBoard?.length).toBe(1); // 3 removed, 1 added = 1 card
        });
    });

    describe("checkGameEnd", () => {
        it("should detect game end when deck empty and no valid SETs", () => {
            const gameState = createMockGameState({
                deck: [],
                board: [
                    { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
                    { id: "2", number: 1, shape: "diamond", shading: "solid", color: "red" },
                    { id: "3", number: 2, shape: "diamond", shading: "solid", color: "red" },
                ],
            });

            const result = gameService.checkGameEnd(gameState);

            expect(result.isFinished).toBe(true);
            expect(result.reason).toContain("No valid SETs remaining");
        });

        it("should detect game end when board is empty", () => {
            const gameState = createMockGameState({
                board: [],
            });

            const result = gameService.checkGameEnd(gameState);

            expect(result.isFinished).toBe(true);
            expect(result.reason).toContain("All cards have been removed");
        });

        it("should not end game when valid SETs exist", () => {
            const gameState = createMockGameState({
                deck: [],
                board: [
                    { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
                    { id: "2", number: 2, shape: "diamond", shading: "solid", color: "red" },
                    { id: "3", number: 3, shape: "diamond", shading: "solid", color: "red" },
                ],
            });

            const result = gameService.checkGameEnd(gameState);

            expect(result.isFinished).toBe(false);
        });

        it("should not end game when deck has cards", () => {
            const gameState = createMockGameState({
                deck: [
                    { id: "4", number: 1, shape: "oval", shading: "solid", color: "green" },
                ],
            });

            const result = gameService.checkGameEnd(gameState);

            expect(result.isFinished).toBe(false);
        });
    });
});

