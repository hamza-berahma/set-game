import { describe, it, expect } from 'vitest';
import { isValidSet } from '../utils/game';
import type { Card } from '../types/game';

describe('Game Logic Tests (Frontend)', () => {
    describe('isValidSet', () => {
        it('should validate SET with all same attributes', () => {
            const card1: Card = {
                id: '1',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card2: Card = {
                id: '2',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card3: Card = {
                id: '3',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            expect(isValidSet(card1, card2, card3)).toBe(true);
        });

        it('should validate SET with all different attributes', () => {
            const card1: Card = {
                id: '1',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card2: Card = {
                id: '2',
                number: 2,
                shape: 'squiggle',
                shading: 'striped',
                color: 'green',
            };
            const card3: Card = {
                id: '3',
                number: 3,
                shape: 'oval',
                shading: 'open',
                color: 'purple',
            };
            expect(isValidSet(card1, card2, card3)).toBe(true);
        });

        it('should reject invalid SET (mixed attributes)', () => {
            const card1: Card = {
                id: '1',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card2: Card = {
                id: '2',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card3: Card = {
                id: '3',
                number: 2,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });

        it('should validate SET with mixed same/different attributes', () => {
            const card1: Card = {
                id: '1',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card2: Card = {
                id: '2',
                number: 1,
                shape: 'squiggle',
                shading: 'striped',
                color: 'green',
            };
            const card3: Card = {
                id: '3',
                number: 1,
                shape: 'oval',
                shading: 'open',
                color: 'purple',
            };
            expect(isValidSet(card1, card2, card3)).toBe(true);
        });

        it('should reject SET with invalid number combination', () => {
            const card1: Card = {
                id: '1',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card2: Card = {
                id: '2',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card3: Card = {
                id: '3',
                number: 2,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });

        it('should reject SET with invalid shape combination', () => {
            const card1: Card = {
                id: '1',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card2: Card = {
                id: '2',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card3: Card = {
                id: '3',
                number: 1,
                shape: 'oval',
                shading: 'solid',
                color: 'red',
            };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });

        it('should reject SET with invalid shading combination', () => {
            const card1: Card = {
                id: '1',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card2: Card = {
                id: '2',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card3: Card = {
                id: '3',
                number: 1,
                shape: 'diamond',
                shading: 'striped',
                color: 'red',
            };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });

        it('should reject SET with invalid color combination', () => {
            const card1: Card = {
                id: '1',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card2: Card = {
                id: '2',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'red',
            };
            const card3: Card = {
                id: '3',
                number: 1,
                shape: 'diamond',
                shading: 'solid',
                color: 'green',
            };
            expect(isValidSet(card1, card2, card3)).toBe(false);
        });
    });
});

