import type { Card, Number, Shape, Shading, Color } from "../types/game";

export function isValidSet(card1: Card, card2: Card, card3: Card): boolean {
    const checkAttribute = <T extends Number | Shape | Shading | Color>(attr1: T, attr2: T, attr3: T): boolean => {
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
