"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("../utils/game");
describe("Game Logic Tests", () => {
    describe("generateDeck", () => {
        it("should generate exactly 81 cards", () => {
            const deck = (0, game_1.generateDeck)();
            expect(deck.length).toBe(81);
        });
        it("should generate unique cards", () => {
            const deck = (0, game_1.generateDeck)();
            const ids = new Set(deck.map((card) => card.id));
            expect(ids.size).toBe(81);
        });
    });
    describe("shuffleDeck", () => {
        it("should return same number of cards", () => {
            const deck = (0, game_1.generateDeck)();
            const shuffled = (0, game_1.shuffleDeck)(deck);
            expect(shuffled.length).toBe(deck.length);
        });
        it("should contain all original cards", () => {
            const deck = (0, game_1.generateDeck)();
            const shuffled = (0, game_1.shuffleDeck)(deck);
            const originalIds = new Set(deck.map((c) => c.id));
            const shuffledIds = new Set(shuffled.map((c) => c.id));
            expect(originalIds).toEqual(shuffledIds);
        });
    });
    describe("isValidSet", () => {
        it("should validate SET with all same attributes", () => {
            const card1 = {
                id: "1",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card2 = {
                id: "2",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card3 = {
                id: "3",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            expect((0, game_1.isValidSet)(card1, card2, card3)).toBe(true);
        });
        it("should validate SET with all different attributes", () => {
            const card1 = {
                id: "1",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card2 = {
                id: "2",
                number: 2,
                shape: "squiggle",
                shading: "striped",
                color: "green",
            };
            const card3 = {
                id: "3",
                number: 3,
                shape: "oval",
                shading: "open",
                color: "purple",
            };
            expect((0, game_1.isValidSet)(card1, card2, card3)).toBe(true);
        });
        it("should reject invalid SET (mixed attributes)", () => {
            const card1 = {
                id: "1",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card2 = {
                id: "2",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card3 = {
                id: "3",
                number: 2,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            expect((0, game_1.isValidSet)(card1, card2, card3)).toBe(false);
        });
        it("should validate SET with mixed same/different attributes", () => {
            const card1 = {
                id: "1",
                number: 1,
                shape: "diamond",
                shading: "solid",
                color: "red",
            };
            const card2 = {
                id: "2",
                number: 1,
                shape: "squiggle",
                shading: "striped",
                color: "green",
            };
            const card3 = {
                id: "3",
                number: 1,
                shape: "oval",
                shading: "open",
                color: "purple",
            };
            expect((0, game_1.isValidSet)(card1, card2, card3)).toBe(true);
        });
    });
    describe("findValidSets", () => {
        it("should find valid SETs on board", () => {
            const board = [
                { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
                { id: "2", number: 2, shape: "diamond", shading: "solid", color: "red" },
                { id: "3", number: 3, shape: "diamond", shading: "solid", color: "red" },
                { id: "4", number: 1, shape: "squiggle", shading: "striped", color: "green" },
            ];
            const sets = (0, game_1.findValidSets)(board);
            expect(sets.length).toBeGreaterThan(0);
        });
    });
});
