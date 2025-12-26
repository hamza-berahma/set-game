"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const game_1 = require("../utils/game");
const RedisCacheService_1 = require("./RedisCacheService");
const gameStates = new Map(); // Fallback in-memory storage
const redisCache = new RedisCacheService_1.RedisCacheService();
class GameService {
    /**
     * Create a new game and save it to Redis (with fallback to in-memory Map)
     */
    async createGame(roomId, playerIds) {
        const deck = (0, game_1.shuffleDeck)((0, game_1.generateDeck)());
        const board = deck.splice(0, 12);
        const gameState = {
            roomId,
            status: "active",
            deck,
            board,
            scores: {},
            players: playerIds,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        playerIds.forEach((playerId) => {
            gameState.scores[playerId] = 0;
        });
        // Try to save to Redis, fallback to in-memory Map
        const saved = await redisCache.saveGameState(roomId, gameState);
        if (!saved) {
            gameStates.set(roomId, gameState);
        }
        return gameState;
    }
    /**
     * Get game state from Redis (with fallback to in-memory Map)
     */
    async getGame(roomId) {
        // Try Redis first
        const cachedGameState = await redisCache.getGameState(roomId);
        if (cachedGameState) {
            return cachedGameState;
        }
        // Fallback to in-memory Map
        return gameStates.get(roomId) || null;
    }
    async processCardSelection(roomId, playerId, cardIds) {
        const gameState = await this.getGame(roomId);
        if (!gameState) {
            return {
                success: false,
                message: "Game not found",
            };
        }
        if (gameState.status !== "active") {
            return {
                success: false,
                message: "Game not active",
            };
        }
        if (cardIds.length !== 3) {
            return {
                success: false,
                message: "Must select exactly 3 cards",
            };
        }
        const selectedCards = [];
        for (const cardId of cardIds) {
            const card = gameState.board.find((c) => c.id === cardId);
            if (!card) {
                return {
                    success: false,
                    message: `Card ${cardId} not on board`,
                };
            }
            selectedCards.push(card);
        }
        if (!(0, game_1.isValidSet)(selectedCards[0], selectedCards[1], selectedCards[2])) {
            return {
                success: false,
                message: "Selected cards do not form a valid set",
            };
        }
        gameState.board = gameState.board.filter((card) => !cardIds.includes(card.id));
        while (gameState.board.length < 12 && gameState.deck.length > 0) {
            const newCard = gameState.deck.pop();
            if (newCard) {
                gameState.board.push(newCard);
            }
        }
        gameState.scores[playerId] = (gameState.scores[playerId] || 0) + 1;
        gameState.updatedAt = new Date();
        const gameEndResult = this.checkGameEnd(gameState);
        if (gameEndResult.isFinished) {
            gameState.status = "finished";
        }
        // Save updated state to Redis (with fallback to in-memory Map)
        const saved = await redisCache.saveGameState(roomId, gameState);
        if (!saved) {
            gameStates.set(roomId, gameState);
        }
        return {
            success: true,
            message: "Valid SET! Card removed and replaced.",
            newBoard: gameState.board,
            newDeck: gameState.deck,
            score: gameState.scores[playerId],
        };
    }
    checkGameEnd(gameState) {
        if (gameState.deck.length === 0) {
            const validSets = (0, game_1.findValidSets)(gameState.board);
            if (validSets.length === 0) {
                return {
                    isFinished: true,
                    reason: "No valid SETs remaining and deck is empty",
                };
            }
        }
        if (gameState.board.length === 0) {
            return {
                isFinished: true,
                reason: "All cards have been removed from the board",
            };
        }
        return { isFinished: false };
    }
    async getValidSetsOnBoard(roomId) {
        const gameState = await this.getGame(roomId);
        if (!gameState) {
            return [];
        }
        return (0, game_1.findValidSets)(gameState.board);
    }
    /**
     * Update existing game state in Redis (with fallback to in-memory Map)
     */
    async updateGameState(roomId, gameState) {
        const saved = await redisCache.saveGameState(roomId, gameState);
        if (!saved) {
            gameStates.set(roomId, gameState);
        }
    }
    /**
     * Delete game state from Redis and in-memory Map
     */
    async deleteGame(roomId) {
        await redisCache.deleteGameState(roomId);
        gameStates.delete(roomId);
    }
}
exports.GameService = GameService;
