import { Server as SocketIOServer } from "socket.io";
import { GameService } from "./GameService";
import { BotAI, generateBotName, generateBotDelay } from "./BotService";
import { EventLogService } from "./EventLogService";

interface BotInstance {
    bot: BotAI;
    timeout: NodeJS.Timeout | null;
    roomId: string;
    isActive: boolean;
}

export class BotManager {
    private bots: Map<string, BotInstance> = new Map();
    private gameService: GameService;
    private eventLogService: EventLogService;
    private io: SocketIOServer | null = null;

    constructor(gameService: GameService, eventLogService: EventLogService) {
        this.gameService = gameService;
        this.eventLogService = eventLogService;
    }

    setIO(io: SocketIOServer) {
        this.io = io;
    }

    /**
     * Add a bot to a room
     */
    async addBotToRoom(roomId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
        const botId = `bot-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const botName = generateBotName(this.bots.size);
        const bot = new BotAI(botId, botName, difficulty);

        const botInstance: BotInstance = {
            bot,
            timeout: null,
            roomId,
            isActive: true,
        };

        this.bots.set(botId, botInstance);

        // Add bot to game state
        const gameState = await this.gameService.getGame(roomId);
        if (gameState) {
            if (!gameState.players.includes(botId)) {
                gameState.players.push(botId);
                gameState.scores[botId] = 0;
                await this.gameService.updateGameState(roomId, gameState);
            }

            // Emit player joined event
            if (this.io) {
                this.io.to(roomId).emit("player:joined", {
                    roomId,
                    playerId: botId,
                    username: botName,
                    players: gameState.players,
                });

                this.io.to(roomId).emit("game:state:update", {
                    roomId,
                    board: gameState.board,
                    deck: gameState.deck,
                    scores: gameState.scores,
                    status: gameState.status,
                    players: gameState.players,
                });
            }

            // Log bot joined
            await this.eventLogService.logPlayerJoined(roomId, botId, roomId);

            // Start bot AI
            this.startBotAI(botId);
        }

        return botId;
    }

    /**
     * Remove a bot from a room
     */
    async removeBot(botId: string): Promise<void> {
        const botInstance = this.bots.get(botId);
        if (!botInstance) return;

        botInstance.isActive = false;
        if (botInstance.timeout) {
            clearTimeout(botInstance.timeout);
        }

        const gameState = await this.gameService.getGame(botInstance.roomId);
        if (gameState) {
            gameState.players = gameState.players.filter(id => id !== botId);
            delete gameState.scores[botId];
            await this.gameService.updateGameState(botInstance.roomId, gameState);

            if (this.io) {
                this.io.to(botInstance.roomId).emit("player:left", {
                    roomId: botInstance.roomId,
                    playerId: botId,
                    username: botInstance.bot.getName(),
                    players: gameState.players,
                });

                this.io.to(botInstance.roomId).emit("game:state:update", {
                    roomId: botInstance.roomId,
                    board: gameState.board,
                    deck: gameState.deck,
                    scores: gameState.scores,
                    status: gameState.status,
                    players: gameState.players,
                });
            }
        }

        this.bots.delete(botId);
    }

    /**
     * Start bot AI loop
     */
    private async startBotAI(botId: string): Promise<void> {
        const botInstance = this.bots.get(botId);
        if (!botInstance || !botInstance.isActive) return;

        const gameState = await this.gameService.getGame(botInstance.roomId);
        if (!gameState || gameState.status !== 'active') {
            return;
        }

        // Bot finds a set
        const cardIds = botInstance.bot.findSet(gameState);
        
        if (cardIds && cardIds.length === 3) {
            // Process bot's move
            const result = await this.gameService.processCardSelection(
                botInstance.roomId,
                botId,
                cardIds
            );

            if (result.success) {
                // Log SET found
                await this.eventLogService.logSetFound(
                    botInstance.roomId,
                    botInstance.roomId,
                    botId,
                    cardIds,
                    result.score || 0
                );

                // Emit events
                if (this.io) {
                    this.io.to(botInstance.roomId).emit("set:found", {
                        roomId: botInstance.roomId,
                        playerId: botId,
                        playerUsername: botInstance.bot.getName(),
                        cardIds,
                        newScore: result.score || 0,
                    });

                    const updatedState = await this.gameService.getGame(botInstance.roomId);
                    if (updatedState) {
                        this.io.to(botInstance.roomId).emit("game:state:update", {
                            roomId: botInstance.roomId,
                            board: updatedState.board,
                            deck: updatedState.deck,
                            scores: updatedState.scores,
                            status: updatedState.status,
                            players: updatedState.players,
                        });

                        if (updatedState.status === "finished") {
                            await this.eventLogService.logGameEnded(
                                botInstance.roomId,
                                botInstance.roomId,
                                updatedState.scores
                            );
                            
                            this.io.to(botInstance.roomId).emit("game:ended", {
                                roomId: botInstance.roomId,
                                scores: updatedState.scores,
                                reason: "Game completed",
                            });
                        }
                    }
                }
            }
        }

        // Schedule next bot move using skewed normal distribution
        if (botInstance.isActive) {
            const delay = botInstance.bot.getDelay();
            botInstance.timeout = setTimeout(() => {
                this.startBotAI(botId);
            }, delay);
        }
    }

    /**
     * Pause all bots in a room
     */
    pauseBotsInRoom(roomId: string): void {
        this.bots.forEach((botInstance, botId) => {
            if (botInstance.roomId === roomId) {
                botInstance.isActive = false;
                if (botInstance.timeout) {
                    clearTimeout(botInstance.timeout);
                    botInstance.timeout = null;
                }
            }
        });
    }

    /**
     * Resume all bots in a room
     */
    resumeBotsInRoom(roomId: string): void {
        this.bots.forEach((botInstance, botId) => {
            if (botInstance.roomId === roomId && !botInstance.isActive) {
                botInstance.isActive = true;
                this.startBotAI(botId);
            }
        });
    }

    /**
     * Remove all bots from a room
     */
    async removeAllBotsFromRoom(roomId: string): Promise<void> {
        const botsToRemove: string[] = [];
        this.bots.forEach((botInstance, botId) => {
            if (botInstance.roomId === roomId) {
                botsToRemove.push(botId);
            }
        });

        for (const botId of botsToRemove) {
            await this.removeBot(botId);
        }
    }
}

