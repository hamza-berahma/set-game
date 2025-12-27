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

        const gameState = await this.gameService.getGame(roomId);
        if (gameState) {
            if (!gameState.players.includes(botId)) {
                gameState.players.push(botId);
                gameState.scores[botId] = 0;
                await this.gameService.updateGameState(roomId, gameState);
            }

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

            await this.eventLogService.logPlayerJoined(roomId, botId, roomId);

            this.startBotAI(botId);
        }

        return botId;
    }

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

    private async startBotAI(botId: string): Promise<void> {
        const botInstance = this.bots.get(botId);
        if (!botInstance || !botInstance.isActive) return;

        const gameState = await this.gameService.getGame(botInstance.roomId);
        if (!gameState || gameState.status !== 'active') {
            return;
        }

        const cardIds = botInstance.bot.findSet(gameState);
        
        if (cardIds && cardIds.length === 3) {
            const currentGameState = await this.gameService.getGame(botInstance.roomId);
            const gameStartTime = currentGameState?.createdAt || new Date();
            
            const result = await this.gameService.processCardSelection(
                botInstance.roomId,
                botId,
                cardIds,
                gameStartTime
            );

            if (result.success) {
                const updatedStateAfterMove = await this.gameService.getGame(botInstance.roomId);
                const matchId = updatedStateAfterMove?.matchId || botInstance.roomId;
                
                await this.eventLogService.logSetFound(
                    botInstance.roomId,
                    matchId,
                    botId,
                    cardIds,
                    result.score || 0
                );

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
                            const matchId = updatedState.matchId || botInstance.roomId;
                            await this.eventLogService.logGameEnded(
                                botInstance.roomId,
                                matchId,
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

        if (botInstance.isActive) {
            const delay = botInstance.bot.getDelay();
            botInstance.timeout = setTimeout(() => {
                this.startBotAI(botId);
            }, delay);
        }
    }

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

    resumeBotsInRoom(roomId: string): void {
        this.bots.forEach((botInstance, botId) => {
            if (botInstance.roomId === roomId && !botInstance.isActive) {
                botInstance.isActive = true;
                this.startBotAI(botId);
            }
        });
    }

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

