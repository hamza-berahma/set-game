import { useState, useEffect } from "react";
import Card from "./Card";
import { StripePatterns } from "./StripePatterns";
import type { Card as CardType } from "../types/game";
import { isValidSet } from "../utils/game";

interface GameBoardProps {
    cards: CardType[];
    onCardSelect: (cardIds: string[]) => void;
    isProcessing?: boolean;
}

export default function GameBoard({ cards, onCardSelect, isProcessing = false }: GameBoardProps) {
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const handleCardClick = (index: number) => {
        if (isProcessing || isValidating) return;

        // Clear any previous errors
        setValidationError(null);

        setSelectedCards((prev) => {
            if (prev.includes(index)) {
                // Deselect
                return prev.filter((i) => i !== index);
            } else if (prev.length < 3) {
                // Select (max 3)
                return [...prev, index];
            }
            return prev;
        });
    };

    useEffect(() => {
        if (selectedCards.length === 3) {
            const selectedCardObjects = selectedCards.map((idx) => cards[idx]);

            // Validate the SET
            const isValid = isValidSet(
                selectedCardObjects[0],
                selectedCardObjects[1],
                selectedCardObjects[2],
            );

            if (isValid) {
                // Valid SET - call onCardSelect and clear selection
                setIsValidating(true);
                const cardIds = selectedCards.map((idx) => cards[idx].id);

                // Simulate validation delay
                setTimeout(() => {
                    onCardSelect(cardIds);
                    setSelectedCards([]);
                    setIsValidating(false);
                    setValidationError(null);
                }, 300);
            } else {
                // Invalid SET - show error
                setIsValidating(true);
                setValidationError(
                    "Selected cards do not form a valid SET. Each attribute must be all the same or all different.",
                );

                // Clear selection after showing error
                setTimeout(() => {
                    setSelectedCards([]);
                    setIsValidating(false);
                    setValidationError(null);
                }, 2000);
            }
        }
    }, [selectedCards, cards, onCardSelect]);

    // Reset selection and errors when cards change
    useEffect(() => {
        setSelectedCards([]);
        setValidationError(null);
        setIsValidating(false);
    }, [cards]);

    const showProcessing = isProcessing || isValidating;

    return (
        <>
            <StripePatterns />
            <div className="space-y-4">
                {/* Error message display */}
                {validationError && (
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                        role="alert"
                    >
                        <span className="block sm:inline">{validationError}</span>
                    </div>
                )}

                {/* Loading/Processing indicator */}
                {showProcessing && !validationError && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                        Validating selection...
                    </div>
                )}

                {/* Game Board */}
                <div
                    className={`grid grid-cols-4 gap-4 p-4 bg-gray-100 rounded-lg ${showProcessing ? "opacity-50 pointer-events-none" : ""}`}
                >
                    {cards.map((card, index) => (
                        <Card
                            key={card.id}
                            card={card}
                            isSelected={selectedCards.includes(index)}
                            onClick={() => handleCardClick(index)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
