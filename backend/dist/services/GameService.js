"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const game_1 = require("../utils/game");
const RedisCacheService_1 = require("./RedisCacheService");
const GameRoomRepository_1 = require("../repositories/GameRoomRepository");
const MatchRepository_1 = require("../repositories/MatchRepository");
const GameStateRepository_1 = require("../repositories/GameStateRepository");
const MoveRepository_1 = require("../repositories/MoveRepository");
const MatchResultRepository_1 = require("../repositories/MatchResultRepository");
const RoomParticipantRepository_1 = require("../repositories/RoomParticipantRepository");
const gameStates = new Map();
const redisCache = new RedisCacheService_1.RedisCacheService();
const gameRoomRepo = new GameRoomRepository_1.GameRoomRepository();
const matchRepo = new MatchRepository_1.MatchRepository();
const gameStateRepo = new GameStateRepository_1.GameStateRepository();
const moveRepo = new MoveRepository_1.MoveRepository();
const matchResultRepo = new MatchResultRepository_1.MatchResultRepository();
const roomParticipantRepo = new RoomParticipantRepository_1.RoomParticipantRepository();
class GameService {
    async createGame(roomId, playerIds, settings) {
        const deck = (0, game_1.shuffleDeck)((0, game_1.generateDeck)());
        const board = deck.splice(0, 12);
        let room = await gameRoomRepo.findByRoomId(roomId);
        if (!room) {
            try {
                room = await gameRoomRepo.create(roomId, {
                    lobby_settings: settings,
                });
            }
            catch (err) {
                console.error("Error creating game room:", err);
            }
        }
        let matchId;
        try {
            const match = await matchRepo.create({
                room_id: room?.room_id || roomId,
                deck_seed: { shuffled: true },
                timer_duration_seconds: settings?.timerDuration || null,
            });
            matchId = match.match_id;
            if (room) {
                await gameRoomRepo.updateCurrentMatch(room.room_id, matchId);
            }
        }
        catch (err) {
            console.error("Error creating match:", err);
        }
        for (const playerId of playerIds) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(playerId) && room) {
                try {
                    await roomParticipantRepo.addParticipant({
                        room_id: room.room_id,
                        user_id: playerId,
                        role: "player",
                    });
                }
                catch (err) {
                    console.error(`Error adding participant ${playerId}:`, err);
                }
            }
        }
        const gameState = {
            roomId,
            matchId,
            status: "active",
            deck,
            board,
            scores: {},
            players: playerIds,
            createdAt: new Date(),
            updatedAt: new Date(),
            sequenceNumber: 0,
        };
        playerIds.forEach((playerId) => {
            gameState.scores[playerId] = 0;
        });
        if (matchId) {
            try {
                await gameStateRepo.saveState({
                    match_id: matchId,
                    board_cards: board,
                    sequence_number: 0,
                });
            }
            catch (err) {
                console.error("Error saving initial game state:", err);
            }
        }
        const saved = await redisCache.saveGameState(roomId, gameState);
        if (!saved) {
            gameStates.set(roomId, gameState);
        }
        return gameState;
    }
    async getGame(roomId) {
        const cachedGameState = await redisCache.getGameState(roomId);
        if (cachedGameState) {
            return cachedGameState;
        }
        return gameStates.get(roomId) || null;
    }
    async processCardSelection(roomId, playerId, cardIds, gameStartTime) {
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
        let previousStateId = null;
        if (gameState.matchId) {
            try {
                const latestState = await gameStateRepo.getLatestState(gameState.matchId);
                previousStateId = latestState?.state_id || null;
            }
            catch (err) {
                console.error("Error getting previous state:", err);
            }
        }
        const offsetMs = gameStartTime
            ? Date.now() - gameStartTime.getTime()
            : Date.now() - gameState.createdAt.getTime();
        let moveId = null;
        if (gameState.matchId) {
            try {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(playerId)) {
                    const move = await moveRepo.create({
                        match_id: gameState.matchId,
                        user_id: playerId,
                        previous_state_id: previousStateId,
                        offset_ms: offsetMs,
                        payload: { cardIds, selectedCards },
                    });
                    moveId = move.move_id;
                }
            }
            catch (err) {
                console.error("Error saving move:", err);
            }
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
        gameState.sequenceNumber = (gameState.sequenceNumber || 0) + 1;
        if (gameState.matchId) {
            try {
                await gameStateRepo.saveState({
                    match_id: gameState.matchId,
                    triggering_move_id: moveId,
                    board_cards: gameState.board,
                    sequence_number: gameState.sequenceNumber,
                });
            }
            catch (err) {
                console.error("Error saving game state:", err);
            }
        }
        const gameEndResult = this.checkGameEnd(gameState);
        if (gameEndResult.isFinished) {
            gameState.status = "finished";
            if (gameState.matchId) {
                try {
                    await matchRepo.updateStatus(gameState.matchId, "finished", new Date());
                    const sortedPlayers = Object.entries(gameState.scores)
                        .sort(([, a], [, b]) => b - a)
                        .map(([playerId], index) => ({
                        playerId,
                        score: gameState.scores[playerId],
                        rank: index + 1,
                    }));
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    const gameDuration = Date.now() - gameState.createdAt.getTime();
                    for (const { playerId, score, rank } of sortedPlayers) {
                        if (uuidRegex.test(playerId)) {
                            try {
                                await matchResultRepo.upsert({
                                    match_id: gameState.matchId,
                                    user_id: playerId,
                                    score,
                                    rank,
                                    duration_played_ms: gameDuration,
                                });
                            }
                            catch (err) {
                                console.error(`Error saving result for ${playerId}:`, err);
                            }
                        }
                    }
                }
                catch (err) {
                    console.error("Error saving match results:", err);
                }
            }
        }
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
    async updateGameState(roomId, gameState) {
        const saved = await redisCache.saveGameState(roomId, gameState);
        if (!saved) {
            gameStates.set(roomId, gameState);
        }
    }
    async deleteGame(roomId) {
        await redisCache.deleteGameState(roomId);
        gameStates.delete(roomId);
    }
    async addPlayerToRoom(roomId, playerId) {
        try {
            const room = await gameRoomRepo.findByRoomId(roomId);
            if (room) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(playerId)) {
                    await roomParticipantRepo.addParticipant({
                        room_id: room.room_id,
                        user_id: playerId,
                        role: "player",
                    });
                }
            }
        }
        catch (err) {
            console.error("Error adding player to room:", err);
        }
    }
    async removePlayerFromRoom(roomId, playerId) {
        try {
            const room = await gameRoomRepo.findByRoomId(roomId);
            if (room) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(playerId)) {
                    await roomParticipantRepo.removeParticipant(room.room_id, playerId);
                }
            }
        }
        catch (err) {
            console.error("Error removing player from room:", err);
        }
    }
    async recoverGameState(roomId) {
        try {
            const cachedState = await this.getGame(roomId);
            if (cachedState) {
                return cachedState;
            }
            const room = await gameRoomRepo.findByRoomId(roomId);
            if (!room || !room.current_match_id) {
                return null;
            }
            const matchId = room.current_match_id;
            const match = await matchRepo.findById(matchId);
            if (!match || match.status === "finished") {
                return null;
            }
            const latestState = await gameStateRepo.getLatestState(matchId);
            if (!latestState) {
                return null;
            }
            const recoveredState = {
                roomId,
                matchId,
                status: match.status,
                deck: [],
                board: latestState.board_cards,
                scores: {},
                players: [],
                createdAt: match.started_at || new Date(),
                updatedAt: latestState.created_at,
                sequenceNumber: latestState.sequence_number,
            };
            const participants = await roomParticipantRepo.getActiveParticipants(room.room_id);
            recoveredState.players = participants.map(p => p.user_id);
            participants.forEach(p => {
                recoveredState.scores[p.user_id] = 0;
            });
            await this.updateGameState(roomId, recoveredState);
            return recoveredState;
        }
        catch (err) {
            console.error("Error recovering game state:", err);
            return null;
        }
    }
}
exports.GameService = GameService;
