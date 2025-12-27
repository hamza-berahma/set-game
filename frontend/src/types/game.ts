export type Number = 1 | 2 | 3;
export type Shape = "diamond" | "squiggle" | "oval";
export type Shading = "solid" | "striped" | "open";
export type Color = "red" | "green" | "purple";

export interface Card {
    id: string;
    number: Number;
    shape: Shape;
    shading: Shading;
    color: Color;
}

export interface GameState {
    roomId: string;
    status: "waiting" | "active" | "finished";
    deck: Card[];
    board: Card[];
    scores: Record<string, number>;
    players: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RoomSettings {
    maxPlayers: number;
    timerDuration: number; // in seconds, 0 means no timer
    isPrivate: boolean;
    roomName?: string;
    playWithBots?: boolean;
}
