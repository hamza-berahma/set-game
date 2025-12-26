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
                        className="bg-set-red border-4 border-black text-white px-4 py-3 uppercase tracking-wider shadow-brutal"
                        role="alert"
                    >
                        <span className="block sm:inline">{validationError}</span>
                    </div>
                )}

                {/* Loading/Processing indicator */}
                {showProcessing && !validationError && (
                    <div className="bg-set-purple border-4 border-black text-white px-4 py-3 uppercase tracking-wider shadow-brutal">
                        Validating selection...
                    </div>
                )}

                {/* Game Board */}
                <div
                    className={`grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 p-4 ${showProcessing ? "opacity-50 pointer-events-none" : ""}`}
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

                {/* Selected Cards Counter */}
                {selectedCards.length > 0 && (
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white border-4 border-black px-6 py-3 shadow-brutal uppercase tracking-wider">
                            <span>{selectedCards.length}/3 Selected</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
