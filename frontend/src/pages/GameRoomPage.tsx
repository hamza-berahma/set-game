import { useParams } from "react-router-dom";

export default function GameRoomPage() {
    const { roomId } = useParams<{ roomId: string }>();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Game Room: {roomId}</h1>
                <p className="text-gray-600">Game room content will go here.</p>
                {/* add here the board state and WebSocket intergration */}
            </div>
        </div>
    );
}
