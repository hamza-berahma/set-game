import { useParams } from "react-router-dom";
import GameBoard from "../components/GameBoard";
import type { Card } from "../types/game";

export default function GameRoomPage() {
    const { roomId } = useParams<{ roomId: string }>();

    // Test cards for Module 8
    const testCards: Card[] = [
        { id: "1", number: 1, shape: "diamond", shading: "solid", color: "red" },
        { id: "2", number: 2, shape: "diamond", shading: "striped", color: "red" },
        { id: "3", number: 3, shape: "diamond", shading: "open", color: "red" },
        { id: "4", number: 1, shape: "squiggle", shading: "solid", color: "red" },
        { id: "5", number: 1, shape: "oval", shading: "solid", color: "green" },
        { id: "6", number: 2, shape: "squiggle", shading: "striped", color: "green" },
        { id: "7", number: 3, shape: "oval", shading: "open", color: "green" },
        { id: "8", number: 1, shape: "diamond", shading: "striped", color: "green" },
        { id: "9", number: 2, shape: "oval", shading: "solid", color: "purple" },
        { id: "10", number: 3, shape: "squiggle", shading: "solid", color: "purple" },
        { id: "11", number: 1, shape: "squiggle", shading: "open", color: "purple" },
        { id: "12", number: 2, shape: "diamond", shading: "open", color: "purple" },
    ];

    const handleCardSelect = (cardIds: string[]) => {
        console.log("Selected cards:", cardIds);
        // TODO: Will connect to backend in Module 9
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Game Room: {roomId}</h1>
                <GameBoard cards={testCards} onCardSelect={handleCardSelect} isProcessing={false} />
            </div>
        </div>
    );
}
