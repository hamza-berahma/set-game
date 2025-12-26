"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../utils/jwt");
const GameService_1 = require("../services/GameService");
const gameService = new GameService_1.GameService();
function initializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
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
        catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        console.log(`User connected: ${user.username} (${user.userId})`);
        socket.on("join-room", async (data) => {
            try {
                const { roomId } = data;
                if (user.roomId) {
                    socket.leave(user.roomId);
                }
                socket.join(roomId);
                user.roomId = roomId;
                let gameState = await gameService.getGame(roomId);
                if (!gameState) {
                    gameState = await gameService.createGame(roomId, [user.userId]);
                }
                else if (!gameState.players.includes(user.userId)) {
                    gameState.players.push(user.userId);
                    gameState.scores[user.userId] = 0;
                    // Update game state in cache
                    await gameService.updateGameState(roomId, gameState);
                }
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
                console.log(`User ${user.username} joined room ${roomId}`);
            }
            catch (error) {
                socket.emit("error", {
                    message: error.message || "Failed to join room",
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
                const result = await gameService.processCardSelection(user.roomId, user.userId, cardIds);
                if (!result.success) {
                    socket.emit("error", {
                        message: result.message,
                        code: "INVALID_SELECTION",
                    });
                    return;
                }
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
                socket.emit("error", {
                    message: error.message || "Failed to process card selection",
                    code: "SELECTION_ERROR",
                });
            }
        });
        socket.on("disconnect", () => {
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
