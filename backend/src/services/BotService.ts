import { Card, GameState } from "../types/game";
import { findValidSets } from "../utils/game";

function skewedNormal(mean: number, stdDev: number, skewness: number = 0): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    const skewed = z0 + skewness * (z0 * z0 - 1) / 2;
    
    return mean + stdDev * skewed;
}

export function generateBotDelay(baseDelay: number = 2000): number {
    const delay = skewedNormal(baseDelay, baseDelay * 0.5, -1.5);
    return Math.max(500, Math.min(5000, delay));
}

export function findThirdCard(card1: Card, card2: Card): Partial<Card> {
    const getThirdValue = <T>(val1: T, val2: T, allValues: T[]): T => {
        if (val1 === val2) {
            return val1;
        } else {
            return allValues.find(v => v !== val1 && v !== val2)!;
        }
    };

    const numbers: Card['number'][] = [1, 2, 3];
    const shapes: Card['shape'][] = ["diamond", "squiggle", "oval"];
    const shadings: Card['shading'][] = ["solid", "striped", "open"];
    const colors: Card['color'][] = ["red", "green", "purple"];

    return {
        number: getThirdValue(card1.number, card2.number, numbers),
        shape: getThirdValue(card1.shape, card2.shape, shapes),
        shading: getThirdValue(card1.shading, card2.shading, shadings),
        color: getThirdValue(card1.color, card2.color, colors),
    };
}

export function findValidSetsOnBoard(board: Card[]): Card[][] {
    return findValidSets(board);
}

export class BotAI {
    private botId: string;
    private botName: string;
    private difficulty: 'easy' | 'medium' | 'hard';

    constructor(botId: string, botName: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
        this.botId = botId;
        this.botName = botName;
        this.difficulty = difficulty;
    }

    findSet(gameState: GameState): string[] | null {
        const validSets = findValidSetsOnBoard(gameState.board);
        
        if (validSets.length === 0) {
            return null;
        }

        let selectedSet: Card[];
        
        switch (this.difficulty) {
            case 'easy':
                selectedSet = validSets[Math.floor(Math.random() * validSets.length)];
                break;
            case 'medium':
                selectedSet = this.selectSetWithHeuristic(validSets);
                break;
            case 'hard':
                selectedSet = this.selectBestSet(validSets);
                break;
            default:
                selectedSet = validSets[0];
        }

        return selectedSet.map(card => card.id);
    }

    private selectSetWithHeuristic(sets: Card[][]): Card[] {
        if (Math.random() < 0.3) {
            return sets[Math.floor(Math.random() * sets.length)];
        }
        
        const scoredSets = sets.map(set => {
            let score = 0;
            const [c1, c2, c3] = set;
            
            if (c1.number === c2.number && c2.number === c3.number) score += 1;
            if (c1.shape === c2.shape && c2.shape === c3.shape) score += 1;
            if (c1.shading === c2.shading && c2.shading === c3.shading) score += 1;
            if (c1.color === c2.color && c2.color === c3.color) score += 1;
            
            return { set, score };
        });

        scoredSets.sort((a, b) => b.score - a.score);
        const topSets = scoredSets.slice(0, Math.min(5, scoredSets.length));
        
        const index = Math.floor(Math.abs(skewedNormal(0, 1, -0.5)) * topSets.length);
        return topSets[Math.min(index, topSets.length - 1)].set;
    }

    private selectBestSet(sets: Card[][]): Card[] {
        if (Math.random() < 0.2) {
            return sets[Math.floor(Math.random() * sets.length)];
        }
        
        const scoredSets = sets.map(set => {
            let score = 0;
            const [c1, c2, c3] = set;
            
            if (c1.number === c2.number && c2.number === c3.number) score += 1.5;
            if (c1.shape === c2.shape && c2.shape === c3.shape) score += 1.5;
            if (c1.shading === c2.shading && c2.shading === c3.shading) score += 1.5;
            if (c1.color === c2.color && c2.color === c3.color) score += 1.5;
            
            return { set, score };
        });

        scoredSets.sort((a, b) => b.score - a.score);
        const topThree = scoredSets.slice(0, Math.min(3, scoredSets.length));
        return topThree[Math.floor(Math.random() * topThree.length)].set;
    }

    getDelay(): number {
        const baseDelays = {
            easy: 6000,
            medium: 4500,
            hard: 3500,
        };
        return generateBotDelay(baseDelays[this.difficulty]);
    }

    getId(): string {
        return this.botId;
    }

    getName(): string {
        return this.botName;
    }
}

export function generateBotName(index: number): string {
    const names = [
        'Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery',
        'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Harper', 'Indigo', 'Jules'
    ];
    return names[index % names.length];
}

