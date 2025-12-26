"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDeck = generateDeck;
exports.shuffleDeck = shuffleDeck;
exports.isValidSet = isValidSet;
exports.findValidSets = findValidSets;
function generateDeck() {
    const numbers = [1, 2, 3];
    const shapes = ["diamond", "squiggle", "oval"];
    const shadings = ["solid", "striped", "open"];
    const colors = ["red", "green", "purple"];
    const deck = [];
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
function shuffleDeck(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function isValidSet(card1, card2, card3) {
    const checkAttribute = (attr1, attr2, attr3) => {
        const allSame = attr1 === attr2 && attr2 === attr3;
        const allDifferent = attr1 !== attr2 && attr2 !== attr3 && attr1 !== attr3;
        return allSame || allDifferent;
    };
    return (checkAttribute(card1.number, card2.number, card3.number) &&
        checkAttribute(card1.shape, card2.shape, card3.shape) &&
        checkAttribute(card1.shading, card2.shading, card3.shading) &&
        checkAttribute(card1.color, card2.color, card3.color));
}
function findValidSets(board) {
    const sets = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = i + 1; j < board.length; j++) {
            for (let k = j + 1; k < board.length; k++) {
                if (isValidSet(board[i], board[j], board[k])) {
                    sets.push([board[i], board[j], board[k]]);
                }
            }
        }
    }
    return sets;
}
