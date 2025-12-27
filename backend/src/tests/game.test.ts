import { Card } from "../types/game";
import { generateDeck, shuffleDeck, isValidSet, findValidSets } from "../utils/game";

describe("Game Logic Tests", () => {
    describe("generateDeck", () => {
        it("should generate exactly 81 cards", () => {
            const deck = generateDeck();
            expect(deck.length).toBe(81);
        });

        it("should generate unique cards", () => {
            const deck = generateDeck();
            const ids = new Set(deck.map((card) => card.id));
            expect(ids.size).toBe(81);
        });
    });

    describe("shuffleDeck", () => {
        it("should return same number of cards", () => {
            const deck = generateDeck();
            const shuffled = shuffleDeck(deck);
            expect(shuffled.length).toBe(deck.length);
        });

        it("should contain all original cards", () => {
            const deck = generateDeck();
            const shuffled = shuffleDeck(deck);
            const originalIds = new Set(deck.map((c) => c.id));
            const shuffledIds = new Set(shuffled.map((c) => c.id));
            expect(originalIds).toEqual(shuffledIds);
        });
    });

    describe("isValidSet", () => {
        it("should validate SET with all same attributes", () => {
            const card1: Card = {
                id: "1",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card2: Card = {
                id: "2",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card3: Card = {
                id: "3",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            expect(isValidSet(card1, card2, card3)).toBe(true);
        });

        it("should validate SET with all different attributes", () => {
            const card1: Card = {
                id: "1",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card2: Card = {
                id: "2",
                number: 2,
                shape: "squiggle",
                shading: "striped",
                color: "green",
            };
            const card3: Card = {
                id: "3",
                number: 3,
                shape: "oval",
                shading: "open",
                color: "purple",
            };
            expect(isValidSet(card1, card2, card3)).toBe(true);
        });

        it("should reject invalid SET (mixed attributes)", () => {
            const card1: Card = {
                id: "1",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card2: Card = {
                id: "2",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card3: Card = {
                id: "3",
                number: 2,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });

        it("should validate SET with mixed same/different attributes", () => {
            const card1: Card = {
                id: "1",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card2: Card = {
                id: "2",
                number: 1,
                shape: "squiggle",
                shading: "striped",
                color: "green",
            };
            const card3: Card = {
                id: "3",
                number: 1,
                shape: "oval",
                shading: "open",
                color: "purple",
            };
            expect(isValidSet(card1, card2, card3)).toBe(true);
        });
    });

    describe("findValidSets", () => {
        it("should find valid SETs on board", () => {
            const board: Card[] = [
                { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
                { id: "2", number: 2, shape: "diamond", shading: "solid", color: "red" },
                { id: "3", number: 3, shape: "diamond", shading: "solid", color: "red" },
                { id: "4", number: 1, shape: "squiggle", shading: "striped", color: "green" },
            ];
            const sets = findValidSets(board);
            expect(sets.length).toBeGreaterThan(0);
        });

        it("should return empty array when no valid SETs exist", () => {
            const board: Card[] = [
                { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
                { id: "2", number: 1, shape: "diamond", shading: "solid", color: "red" },
                { id: "3", number: 2, shape: "diamond", shading: "solid", color: "red" },
            ];
            const sets = findValidSets(board);
            expect(sets.length).toBe(0);
        });

        it("should not return duplicate SETs", () => {
            const board: Card[] = [
                { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
                { id: "2", number: 2, shape: "diamond", shading: "solid", color: "red" },
                { id: "3", number: 3, shape: "diamond", shading: "solid", color: "red" },
            ];
            const sets = findValidSets(board);
            expect(sets.length).toBe(1);
        });
    });

    describe("isValidSet edge cases", () => {
        it("should reject SET with two same and one different number", () => {
            const card1: Card = { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" };
            const card2: Card = { id: "2", number: 1, shape: "diamond", shading: "solid", color: "red" };
            const card3: Card = { id: "3", number: 2, shape: "diamond", shading: "solid", color: "red" };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });

        it("should reject SET with two same and one different shape", () => {
            const card1: Card = { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" };
            const card2: Card = { id: "2", number: 1, shape: "diamond", shading: "solid", color: "red" };
            const card3: Card = { id: "3", number: 1, shape: "oval", shading: "solid", color: "red" };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });

        it("should reject SET with two same and one different shading", () => {
            const card1: Card = { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" };
            const card2: Card = { id: "2", number: 1, shape: "diamond", shading: "solid", color: "red" };
            const card3: Card = { id: "3", number: 1, shape: "diamond", shading: "striped", color: "red" };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });

        it("should reject SET with two same and one different color", () => {
            const card1: Card = { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" };
            const card2: Card = { id: "2", number: 1, shape: "diamond", shading: "solid", color: "red" };
            const card3: Card = { id: "3", number: 1, shape: "diamond", shading: "solid", color: "green" };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });

        it("should validate complex valid SET", () => {
            // All different numbers, all same shape, all different shading, all different color
            const card1: Card = { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" };
            const card2: Card = { id: "2", number: 2, shape: "diamond", shading: "striped", color: "green" };
            const card3: Card = { id: "3", number: 3, shape: "diamond", shading: "open", color: "purple" };
            expect(isValidSet(card1, card2, card3)).toBe(true);
        });
    });
});