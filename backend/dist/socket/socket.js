"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
const jwt_1 = require("../utils/jwt");
const GameService_1 = require("../services/GameService");
const EventLogService_1 = require("../services/EventLogService");
const BotManager_1 = require("../services/BotManager");
const TimerService_1 = require("../services/TimerService");
const MatchRepository_1 = require("../repositories/MatchRepository");
const MatchResultRepository_1 = require("../repositories/MatchResultRepository");
const gameService = new GameService_1.GameService();
const eventLogService = new EventLogService_1.EventLogService();
const botManager = new BotManager_1.BotManager(gameService, eventLogService);
const timerService = new TimerService_1.TimerService();
const matchRepo = new MatchRepository_1.MatchRepository();
const matchResultRepo = new MatchResultRepository_1.MatchResultRepository();
function initializeSocket(server) {
    const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173');
    // Normalize CORS origins: trim whitespace and remove trailing slashes
    const corsOrigins = corsOrigin === '*'
        ? '*'
        : corsOrigin.split(',').map(origin => origin.trim().replace(/\/+$/, ''));
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: corsOrigins,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    // Initialize Redis adapter for horizontal scaling
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    let hasLoggedRedisWarning = false;
    try {
        const pubClient = (0, redis_1.createClient)({ url: redisUrl });
        const subClient = pubClient.duplicate();
        pubClient.on("error", (err) => {
            if (!hasLoggedRedisWarning) {
                console.warn("Redis not available - using in-memory Socket.IO adapter (single instance only)");
                console.warn("To enable horizontal scaling, add Redis service and link REDIS_URL in Railway");
                hasLoggedRedisWarning = true;
            }
        });
        subClient.on("error", (err) => {
            // Already logged by pubClient
        });
        Promise.all([pubClient.connect(), subClient.connect()])
            .then(() => {
            io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
            console.log("Socket.IO Redis adapter initialized - horizontal scaling enabled");
        })
            .catch((err) => {
            console.warn("Failed to initialize Redis adapter - using in-memory adapter (single instance only):", err.message);
            console.warn("To enable horizontal scaling, ensure Redis is available at:", redisUrl);
        });
    }
    catch (err) {
        console.warn("Redis adapter initialization failed - using in-memory adapter:", err instanceof Error ? err.message : String(err));
    }
    botManager.setIO(io);
    timerService.setIO(io);
    timerService.setOnTimerEnd(async (roomId, matchId) => {
        const gameState = await gameService.getGame(roomId);
        if (gameState && gameState.status === "active") {
            gameState.status = "finished";
            await matchRepo.updateStatus(matchId, "finished", new Date());
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
                            match_id: matchId,
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
            await gameService.updateGameState(roomId, gameState);
            await eventLogService.logGameEnded(roomId, matchId, gameState.scores);
            io.to(roomId).emit("game:ended", {
                roomId,
                scores: gameState.scores,
                reason: "Time's up!",
            });
        }
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
        if (!token) {
            return next(new Error("Authentication token required"));
        }
        try {
            const payload = (0, jwt_1.verifyToken)(token);
            socket.data.user = {
                userId: payload.user_id,
                username: payload.username,
            };
            next();
        }
        catch {
            next(new Error("Invalid or expired token"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        console.log(`User connected: ${user.username} (${user.userId})`);
        socket.on("join-room", async (data) => {
            try {
                const { roomId, settings } = data;
                console.log(`User ${user.username} joining room ${roomId} with settings:`, settings);
                if (user.roomId) {
                    socket.leave(user.roomId);
                }
                socket.join(roomId);
                user.roomId = roomId;
                let gameState = await gameService.getGame(roomId);
                if (!gameState) {
                    // Log room creation when first player joins
                    await eventLogService.logRoomCreated(roomId, user.userId, settings);
                    gameState = await gameService.createGame(roomId, [user.userId], {
                        timerDuration: settings?.timerDuration,
                        maxPlayers: settings?.maxPlayers,
                        playWithBots: settings?.playWithBots,
                        isPrivate: settings?.isPrivate,
                        roomName: settings?.roomName,
                    });
                    await gameService.addPlayerToRoom(roomId, user.userId);
                    await eventLogService.logGameStarted(roomId, gameState.matchId || roomId);
                    if (settings?.timerDuration && settings.timerDuration > 0) {
                        const matchId = gameState.matchId || roomId;
                        console.log(`Starting timer for room ${roomId}, match ${matchId}, duration: ${settings.timerDuration}s`);
                        await timerService.startTimer(roomId, matchId, settings.timerDuration);
                    }
                    const playWithBots = settings?.playWithBots !== false;
                    console.log(`Play with bots: ${playWithBots} (settings:`, settings, ')');
                    if (playWithBots) {
                        const numBots = Math.floor(Math.random() * 2) + 1;
                        console.log(`Adding ${numBots} bot(s) to room ${roomId}`);
                        for (let i = 0; i < numBots; i++) {
                            const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
                            await botManager.addBotToRoom(roomId, difficulty);
                        }
                    }
                }
                else if (!gameState.players.includes(user.userId)) {
                    gameState.players.push(user.userId);
                    gameState.scores[user.userId] = 0;
                    await gameService.updateGameState(roomId, gameState);
                    await gameService.addPlayerToRoom(roomId, user.userId);
                }
                await eventLogService.logPlayerJoined(roomId, user.userId, gameState.matchId || roomId);
                socket.to(roomId).emit("player:joined", {
                    roomId,
                    playerId: user.userId,
                    username: user.username,
                    players: gameState.players,
                });
                socket.emit("game:state:update", {
                    roomId,
                    board: gameState.board,
                    deck: gameState.deck,
                    scores: gameState.scores,
                    status: gameState.status,
                    players: gameState.players,
                });
                // Send timer info if timer is active (for players joining mid-game)
                if (gameState.matchId) {
                    const remaining = timerService.getRemainingTime(roomId);
                    if (remaining !== null && remaining > 0) {
                        const timerInfo = timerService.getTimerInfo(roomId);
                        if (timerInfo) {
                            socket.emit("timer:start", {
                                roomId,
                                matchId: gameState.matchId,
                                duration: timerInfo.duration,
                                startedAt: timerInfo.startedAt.toISOString(),
                            });
                            socket.emit("timer:update", {
                                roomId,
                                matchId: gameState.matchId,
                                remaining,
                                total: timerInfo.duration,
                            });
                        }
                    }
                }
                console.log(`User ${user.username} joined room ${roomId}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to join room";
                socket.emit("error", {
                    message: errorMessage,
                    code: "JOIN_ROOM_ERROR",
                });
            }
        });
        socket.on("leave-room", async () => {
            if (user.roomId) {
                socket.leave(user.roomId);
                const gameState = await gameService.getGame(user.roomId);
                if (gameState) {
                    socket.to(user.roomId).emit("player:left", {
                        roomId: user.roomId,
                        playerId: user.userId,
                        username: user.username,
                        players: gameState.players.filter((id) => id !== user.userId),
                    });
                }
                await gameService.removePlayerFromRoom(user.roomId, user.userId);
                await eventLogService.logPlayerLeft(user.roomId, user.userId, gameState?.matchId || user.roomId);
                console.log(`User ${user.username} left room ${user.roomId}`);
                user.roomId = undefined;
            }
        });
        socket.on("game:select:cards", async (data) => {
            try {
                if (!user.roomId) {
                    socket.emit("error", {
                        message: "You must join a room first",
                        code: "NOT_IN_ROOM",
                    });
                    return;
                }
                const { cardIds } = data;
                const currentGameState = await gameService.getGame(user.roomId);
                if (!currentGameState) {
                    socket.emit("error", {
                        message: "Game not found",
                        code: "GAME_NOT_FOUND",
                    });
                    return;
                }
                const result = await gameService.processCardSelection(user.roomId, user.userId, cardIds, currentGameState.createdAt);
                if (!result.success) {
                    socket.emit("error", {
                        message: result.message,
                        code: "INVALID_SELECTION",
                    });
                    return;
                }
                const updatedGameState = await gameService.getGame(user.roomId);
                const matchId = updatedGameState?.matchId || user.roomId;
                await eventLogService.logSetFound(user.roomId, matchId, user.userId, cardIds, result.score || 0);
                const offsetMs = Date.now() - (currentGameState.createdAt.getTime());
                await eventLogService.logMove(user.roomId, matchId, user.userId, cardIds, offsetMs);
                io.to(user.roomId).emit("set:found", {
                    roomId: user.roomId,
                    playerId: user.userId,
                    playerUsername: user.username,
                    cardIds,
                    newScore: result.score || 0,
                });
                const gameState = await gameService.getGame(user.roomId);
                if (gameState) {
                    io.to(user.roomId).emit("game:state:update", {
                        roomId: user.roomId,
                        board: gameState.board,
                        deck: gameState.deck,
                        scores: gameState.scores,
                        status: gameState.status,
                        players: gameState.players,
                    });
                    if (gameState.status === "finished") {
                        timerService.stopTimer(user.roomId);
                        await eventLogService.logGameEnded(user.roomId, gameState.matchId || user.roomId, gameState.scores);
                        io.to(user.roomId).emit("game:ended", {
                            roomId: user.roomId,
                            scores: gameState.scores,
                            reason: "Game completed",
                        });
                    }
                }
                console.log(`User ${user.username} found a SET in room ${user.roomId}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to process card selection";
                socket.emit("error", {
                    message: errorMessage,
                    code: "SELECTION_ERROR",
                });
            }
        });
        socket.on("reconnect", async (data) => {
            try {
                const roomId = data?.roomId || user.roomId;
                if (!roomId) {
                    return;
                }
                console.log(`User ${user.username} reconnecting to room ${roomId}`);
                const recoveredState = await gameService.recoverGameState(roomId);
                if (recoveredState) {
                    socket.join(roomId);
                    user.roomId = roomId;
                    socket.emit("game:state:update", {
                        roomId,
                        board: recoveredState.board,
                        deck: recoveredState.deck,
                        scores: recoveredState.scores,
                        status: recoveredState.status,
                        players: recoveredState.players,
                    });
                    if (recoveredState.matchId) {
                        const match = await matchRepo.findById(recoveredState.matchId);
                        if (match && match.timer_duration_seconds && match.timer_duration_seconds > 0 && match.started_at) {
                            const remaining = timerService.calculateRemainingTime(recoveredState.matchId, match.timer_duration_seconds, match.started_at);
                            if (remaining > 0 && recoveredState.status === "active") {
                                await timerService.resumeTimer(roomId, recoveredState.matchId, match.timer_duration_seconds, match.started_at);
                            }
                        }
                    }
                    console.log(`User ${user.username} reconnected and recovered game state`);
                }
                else {
                    console.log(`No game state to recover for room ${roomId}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to reconnect";
                console.error("Error during reconnection:", error);
                socket.emit("error", {
                    message: errorMessage,
                    code: "RECONNECT_ERROR",
                });
            }
        });
        socket.on("disconnect", async () => {
            if (user.roomId) {
                socket.to(user.roomId).emit("player:left", {
                    roomId: user.roomId,
                    playerId: user.userId,
                    username: user.username,
                    players: [],
                });
                console.log(`User ${user.username} disconnected from room ${user.roomId}`);
            }
            console.log(`User disconnected: ${user.username}`);
        });
        socket.emit("hello", {
            message: `Welcome ${user.username}!`,
            userId: user.userId,
        });
    });
    return io;
}
