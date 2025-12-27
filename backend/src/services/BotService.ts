import { Card, GameState } from "../types/game";
import { isValidSet, findValidSets } from "../utils/game";

/**
 * Skewed normal distribution generator
 * Uses Box-Muller transform with skewness parameter
 */
function skewedNormal(mean: number, stdDev: number, skewness: number = 0): number {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Apply skewness
    const skewed = z0 + skewness * (z0 * z0 - 1) / 2;
    
    // Scale and shift
    return mean + stdDev * skewed;
}

/**
 * Generate delay using skewed normal distribution
 * Skewed towards faster responses (negative skew)
 */
export function generateBotDelay(baseDelay: number = 2000): number {
    // Negative skewness for faster responses
    const delay = skewedNormal(baseDelay, baseDelay * 0.5, -1.5);
    // Clamp between 500ms and 5000ms
    return Math.max(500, Math.min(5000, delay));
}

/**
 * Find the third card that completes a SET with two given cards
 */
export function findThirdCard(card1: Card, card2: Card): Partial<Card> {
    const getThirdValue = <T>(val1: T, val2: T, allValues: T[]): T => {
        if (val1 === val2) {
            return val1; // All same
        } else {
            // All different - find the third value
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

/**
 * Find all valid sets on the board
 */
export function findValidSetsOnBoard(board: Card[]): Card[][] {
    return findValidSets(board);
}

/**
 * Bot AI to find a valid set using probability-based selection
 * Uses skewed normal distribution for card selection priority
 */
export class BotAI {
    private botId: string;
    private botName: string;
    private difficulty: 'easy' | 'medium' | 'hard';

    constructor(botId: string, botName: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
        this.botId = botId;
        this.botName = botName;
        this.difficulty = difficulty;
    }

    /**
     * Find a set using intelligent probability-based search
     */
    findSet(gameState: GameState): string[] | null {
        const validSets = findValidSetsOnBoard(gameState.board);
        
        if (validSets.length === 0) {
            return null;
        }

        // Probability-based selection based on difficulty
        let selectedSet: Card[];
        
        switch (this.difficulty) {
            case 'easy':
                // Easy bots pick randomly from available sets
                selectedSet = validSets[Math.floor(Math.random() * validSets.length)];
                break;
            case 'medium':
                // Medium bots prefer sets with more visual similarity (heuristic)
                selectedSet = this.selectSetWithHeuristic(validSets);
                break;
            case 'hard':
                // Hard bots pick the "best" set (most similar attributes)
                selectedSet = this.selectBestSet(validSets);
                break;
            default:
                selectedSet = validSets[0];
        }

        return selectedSet.map(card => card.id);
    }

    /**
     * Select set using heuristic (prefer sets with more similar attributes)
     */
    private selectSetWithHeuristic(sets: Card[][]): Card[] {
        // Score each set based on attribute similarity
        const scoredSets = sets.map(set => {
            let score = 0;
            const [c1, c2, c3] = set;
            
            // More similar attributes = higher score
            if (c1.number === c2.number && c2.number === c3.number) score += 2;
            if (c1.shape === c2.shape && c2.shape === c3.shape) score += 2;
            if (c1.shading === c2.shading && c2.shading === c3.shading) score += 2;
            if (c1.color === c2.color && c2.color === c3.color) score += 2;
            
            return { set, score };
        });

        // Use skewed normal distribution to select (prefer higher scores but with randomness)
        scoredSets.sort((a, b) => b.score - a.score);
        const topSets = scoredSets.slice(0, Math.min(3, scoredSets.length));
        
        // Skewed selection towards top sets
        const index = Math.floor(Math.abs(skewedNormal(0, 1, -1.5)) * topSets.length);
        return topSets[Math.min(index, topSets.length - 1)].set;
    }

    /**
     * Select the "best" set (most similar attributes)
     */
    private selectBestSet(sets: Card[][]): Card[] {
        const scoredSets = sets.map(set => {
            let score = 0;
            const [c1, c2, c3] = set;
            
            if (c1.number === c2.number && c2.number === c3.number) score += 2;
            if (c1.shape === c2.shape && c2.shape === c3.shape) score += 2;
            if (c1.shading === c2.shading && c2.shading === c3.shading) score += 2;
            if (c1.color === c2.color && c2.color === c3.color) score += 2;
            
            return { set, score };
        });

        scoredSets.sort((a, b) => b.score - a.score);
        return scoredSets[0].set;
    }

    /**
     * Get bot delay based on difficulty
     */
    getDelay(): number {
        const baseDelays = {
            easy: 4000,
            medium: 2500,
            hard: 1500,
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

/**
 * Generate bot names
 */
export function generateBotName(index: number): string {
    const names = [
        'Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery',
        'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Harper', 'Indigo', 'Jules'
    ];
    return names[index % names.length];
}

