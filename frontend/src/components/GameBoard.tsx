import { useState, useEffect } from "react";
import Card from "./Card";
import type { Card as CardType } from "../types/game";
import { isValidSet } from "../utils/game";
import { useToast } from "../hooks/useToast";

interface GameBoardProps {
    cards: CardType[];
    onCardSelect: (cardIds: string[]) => void;
    isProcessing?: boolean;
}

export default function GameBoard({ cards, onCardSelect, isProcessing = false }: GameBoardProps) {
    const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
    const [isValidating, setIsValidating] = useState(false);
    const { showToast } = useToast();

    const handleCardClick = (cardId: string) => {
        if (isProcessing || isValidating) return;

        setSelectedCardIds((prev) => {
            if (prev.includes(cardId)) {
                return prev.filter((id) => id !== cardId);
            } else if (prev.length < 3) {
                return [...prev, cardId];
            }
            return prev;
        });
    };

    useEffect(() => {
        if (selectedCardIds.length === 3 && !isValidating) {
            const selectedCardObjects = selectedCardIds
                .map((cardId) => cards.find((c) => c.id === cardId))
                .filter((card): card is CardType => card !== undefined);

            if (selectedCardObjects.length !== 3) {
                setSelectedCardIds([]);
                return;
            }

            const isValid = isValidSet(
                selectedCardObjects[0],
                selectedCardObjects[1],
                selectedCardObjects[2],
            );

            setIsValidating(true);

            if (isValid) {
                const cardIds = selectedCardObjects.map((c) => c.id);

                setTimeout(() => {
                    onCardSelect(cardIds);
                    setSelectedCardIds([]);
                    setIsValidating(false);
                }, 300);
            } else {
                const errorMsg = "Selected cards do not form a valid SET. Each attribute must be all the same or all different.";
                showToast(errorMsg, 'error');

                setTimeout(() => {
                    setSelectedCardIds([]);
                    setIsValidating(false);
                }, 2000);
            }
        } else if (selectedCardIds.length !== 3) {
            if (isValidating) {
                setIsValidating(false);
            }
        }
    }, [selectedCardIds, cards, isValidating, onCardSelect, showToast]);

    useEffect(() => {
        const cardIdsOnBoard = new Set(cards.map((c) => c.id));
        const allSelectedStillOnBoard = selectedCardIds.every((id) => cardIdsOnBoard.has(id));
        
        if (!allSelectedStillOnBoard && selectedCardIds.length > 0) {
            setSelectedCardIds([]);
            setIsValidating(false);
        }
    }, [cards, selectedCardIds]);

    const showProcessing = isProcessing || isValidating;

    return (
        <div className="space-y-4">
            {showProcessing && (
                <div className="bg-set-purple border-4 border-black text-white px-4 py-3 uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Validating selection...
                </div>
            )}

            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6">
                <div
                    className={`card-grid grid grid-cols-4 justify-items-center ${showProcessing ? "opacity-50 pointer-events-none" : ""}`}
                >
                    {cards.map((card) => (
                        <Card
                            key={card.id}
                            card={card}
                            isSelected={selectedCardIds.includes(card.id)}
                            onClick={() => handleCardClick(card.id)}
                        />
                    ))}
                </div>

                {selectedCardIds.length > 0 && (
                    <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 bg-white border-4 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-black">
                            <span>{selectedCardIds.length}/3 Selected</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
