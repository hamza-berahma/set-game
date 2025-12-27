import { Card } from "../types/game";

export interface SocketUser {
    userId: string;
    username: string;
    roomId?: string;
}

export interface JoinRoomData {
    roomId: string;
    token: string;
    settings?: {
        playWithBots?: boolean;
        maxPlayers?: number;
        timerDuration?: number;
    };
}

export interface SelectCardsData {
    roomId: string;
    cardIds: string[];
}

export interface GameStateUpdate {
    roomId: string;
    board: Card[];
    deck: Card[];
    scores: Record<string, number>;
    status: "waiting" | "active" | "finished";
    players: string[];
}

export interface SetFoundEvent {
    roomId: string;
    playerId: string;
    playerUsername: string;
    cardIds: string[];
    newScore: number;
}

export interface PlayerJoinedEvent {
    roomId: string;
    playerId: string;
    username: string;
    players: string[];
}

export interface PlayerLeftEvent {
    roomId: string;
    playerId: string;
    username: string;
    players: string[];
}

export interface SocketError {
    message: string;
    code?: string;
}
