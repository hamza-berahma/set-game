import { Card, Number, Shape, Shading, Color } from "../types/game";

export function generateDeck(): Card[] {
    const numbers: Number[] = [1, 2, 3];
    const shapes: Shape[] = ["diamond", "squiggle", "oval"];
    const shadings: Shading[] = ["solid", "striped", "open"];
    const colors: Color[] = ["red", "green", "purple"];

    const deck: Card[] = [];

    for (const number of numbers) {
        for (const shape of shapes) {
            for (const shading of shadings) {
                for (const color of colors) {
                    deck.push({
                        id: `${number}-${shape}-${shading}-${color}`,
                        number,
                        shape,
                        shading,
                        color,
                    });
                }
            }
        }
    }
    return deck;
}

export function shuffleDeck<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function isValidSet(card1: Card, card2: Card, card3: Card): boolean {
    const checkAttribute = (attr1: any, attr2: any, attr3: any) => {
        const allSame = attr1 === attr2 && attr2 === attr3;
        const allDifferent = attr1 !== attr2 && attr2 !== attr3 && attr1 !== attr3;
        return allSame || allDifferent;
    };

    return (
        checkAttribute(card1.number, card2.number, card3.number) &&
        checkAttribute(card1.shape, card2.shape, card3.shape) &&
        checkAttribute(card1.shading, card2.shading, card3.shading) &&
        checkAttribute(card1.color, card2.color, card3.color)
    );
}

export function findValidSets(board: Card[]): Card[][] {
    const sets: Card[][] = [];
    const seen = new Set<string>();
    
    for (let i = 0; i < board.length; i++) {
        for (let j = i + 1; j < board.length; j++) {
            for (let k = j + 1; k < board.length; k++) {
                if (isValidSet(board[i], board[j], board[k])) {
                    // Create sorted ID to avoid duplicates
                    const cardIds = [board[i].id, board[j].id, board[k].id].sort();
                    const setId = cardIds.join('-');
                    
                    if (!seen.has(setId)) {
                        seen.add(setId);
                        sets.push([board[i], board[j], board[k]]);
                    }
                }
            }
        }
    }
    return sets;
}
