import { Socket } from 'socket.io-client';
import type { GameState } from '../types/game';

export interface SocketEventHandlers {
    onGameStateUpdate?: (gameState: GameState) => void;
    onSetFound?: (data: {
        roomId: string;
        playerId: string;
        playerUsername: string;
        cardIds: string[];
        newScore: number;
    }) => void;
    onPlayerJoined?: (data: {
        roomId: string;
        playerId: string;
        username: string;
        players: string[];
    }) => void;
    onPlayerLeft?: (data: {
        roomId: string;
        playerId: string;
        username: string;
        players: string[];
    }) => void;
    onGameEnded?: (data: {
        roomId: string;
        scores: Record<string, number>;
        reason: string;
    }) => void;
    onTimerStart?: (data: {
        roomId: string;
        matchId: string;
        duration: number;
        startedAt: string;
    }) => void;
    onTimerUpdate?: (data: {
        roomId: string;
        matchId: string;
        remaining: number;
        total: number;
    }) => void;
    onTimerEnd?: (data: {
        roomId: string;
        matchId: string;
    }) => void;
    onError?: (error: { message: string; code?: string }) => void;
}

export class SocketService {
    private socket: Socket | null = null;
    private handlers: SocketEventHandlers = {};

    setSocket(socket: Socket | null) {
        this.socket = socket;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.off('game:state:update');
        this.socket.off('set:found');
        this.socket.off('player:joined');
        this.socket.off('player:left');
        this.socket.off('game:ended');
        this.socket.off('timer:start');
        this.socket.off('timer:update');
        this.socket.off('timer:end');
        this.socket.off('error');

        this.socket.on('game:state:update', (data: GameState) => {
            this.handlers.onGameStateUpdate?.(data);
        });

        this.socket.on('set:found', (data) => {
            this.handlers.onSetFound?.(data);
        });

        this.socket.on('player:joined', (data) => {
            this.handlers.onPlayerJoined?.(data);
        });

        this.socket.on('player:left', (data) => {
            this.handlers.onPlayerLeft?.(data);
        });

        this.socket.on('game:ended', (data) => {
            this.handlers.onGameEnded?.(data);
        });

        this.socket.on('timer:start', (data) => {
            this.handlers.onTimerStart?.(data);
        });

        this.socket.on('timer:update', (data) => {
            this.handlers.onTimerUpdate?.(data);
        });

        this.socket.on('timer:end', (data) => {
            this.handlers.onTimerEnd?.(data);
        });

        this.socket.on('error', (error) => {
            this.handlers.onError?.(error);
        });
    }

    setHandlers(handlers: SocketEventHandlers) {
        this.handlers = { ...this.handlers, ...handlers };
        this.setupEventListeners();
    }

    joinRoom(roomId: string, settings?: { playWithBots?: boolean; maxPlayers?: number; timerDuration?: number; isPrivate?: boolean; roomName?: string }) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('join-room', { roomId, settings });
    }

    leaveRoom() {
        if (!this.socket) {
            return;
        }
        this.socket.emit('leave-room');
    }

    selectCards(roomId: string, cardIds: string[]) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('game:select:cards', { roomId, cardIds });
    }

    reconnect(roomId: string) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('reconnect', { roomId });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();