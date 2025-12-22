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
    createdAt: Date;
    updatedAt: Date;
}

export interface CardSelectionResult {
    success: boolean;
    message: string;
    newBoard?: Card[];
    newDeck?: Card[];
    score?: number;
}
