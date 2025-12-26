import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import { useSocket } from '../hooks/useSocket';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores/authStore';
import type { GameState } from '../types/game';

export default function GameRoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const { socket, isConnected, error: socketError } = useSocket();
    const { user } = useAuthStore();
    
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    // Initialize socket service
    useEffect(() => {
        if (socket) {
            socketService.setSocket(socket);
        }
        return () => {
            socketService.disconnect();
        };
    }, [socket]);

    // Join room when socket is connected and roomId is available
    useEffect(() => {
        if (socket && isConnected && roomId) {
            socketService.joinRoom(roomId);
        }
        return () => {
            if (roomId) {
                socketService.leaveRoom();
            }
        };
    }, [socket, isConnected, roomId]);

    // Set up event handlers
    useEffect(() => {
        socketService.setHandlers({
            onGameStateUpdate: (state: GameState) => {
                setGameState(state);
                setIsProcessing(false);
            },
            onSetFound: (data) => {
                if (data.playerId === user?.user_id) {
                    setNotification({
                        message: `You found a SET! +${data.newScore} points`,
                        type: 'success',
                    });
                } else {
                    setNotification({
                        message: `${data.playerUsername} found a SET!`,
                        type: 'info',
                    });
                }
                setTimeout(() => setNotification(null), 3000);
            },
            onPlayerJoined: (data) => {
                setNotification({
                    message: `${data.username} joined the game`,
                    type: 'info',
                });
                setTimeout(() => setNotification(null), 2000);
            },
            onPlayerLeft: (data) => {
                setNotification({
                    message: `${data.username} left the game`,
                    type: 'info',
                });
                setTimeout(() => setNotification(null), 2000);
            },
            onGameEnded: () => {
                setNotification({
                    message: 'Game ended!',
                    type: 'info',
                });
            },
            onError: (error) => {
                setNotification({
                    message: error.message,
                    type: 'error',
                });
                setIsProcessing(false);
                setTimeout(() => setNotification(null), 3000);
            },
        });
    }, [user]);

    const handleCardSelect = (cardIds: string[]) => {
        if (!roomId || !socket || !isConnected) {
            setNotification({
                message: 'Not connected to server',
                type: 'error',
            });
            return;
        }

        setIsProcessing(true);
        socketService.selectCards(roomId, cardIds);
    };

    // Display connection status
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-beige p-8 flex items-center justify-center">
                <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="text-lg font-semibold mb-2 uppercase tracking-wider text-black">
                        {socketError ? 'Connection Error' : 'Connecting...'}
                    </div>
                    {socketError && (
                        <div className="text-red-600 text-sm uppercase tracking-wider text-black">{socketError}</div>
                    )}
                </div>
            </div>
        );
    }

    const cards = gameState?.board || [];

    return (
        <div className="min-h-screen bg-beige p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl font-bold uppercase tracking-wider text-black">Game Room: {roomId}</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-set-green border-2 border-black"></div>
                                <span className="text-sm uppercase tracking-wider text-black">Connected</span>
                            </div>
                        </div>
                        {gameState && (
                            <div className="flex items-center gap-4 text-sm uppercase tracking-wider text-black">
                                <div>
                                    Status: <span className="font-semibold">{gameState.status}</span>
                                </div>
                                <div>
                                    Players: <span className="font-semibold">{gameState.players.length}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notification Banner */}
                {notification && (
                    <div
                        className={`mb-4 p-4 border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                            notification.type === 'success'
                                ? 'bg-set-green text-white'
                                : notification.type === 'error'
                                  ? 'bg-set-red text-white'
                                  : 'bg-set-purple text-white'
                        }`}
                    >
                        {notification.message}
                    </div>
                )}

                {/* Main Game Layout */}
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    {/* Game Board */}
                    <div>
                        <GameBoard
                            cards={cards}
                            onCardSelect={handleCardSelect}
                            isProcessing={isProcessing}
                        />
                    </div>

                    {/* Player Scores Sidebar */}
                    {gameState && gameState.players.length > 0 && (
                        <div>
                            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-4">
                                <h3 className="text-lg uppercase tracking-widest mb-4 text-black">Players</h3>
                                <div className="space-y-3">
                                    {gameState.players.map((playerId) => (
                                        <div
                                            key={playerId}
                                            className={`border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                                playerId === user?.user_id
                                                    ? 'bg-gold'
                                                    : 'bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm uppercase tracking-wider font-semibold text-black">
                                                    {playerId === user?.user_id ? 'You' : `Player ${playerId.slice(0, 8)}`}
                                                </span>
                                            </div>
                                            <div className="text-2xl font-bold text-black">
                                                {gameState.scores[playerId] || 0} pts
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Game Ended Message */}
                {gameState?.status === 'finished' && (
                    <div className="mt-6 bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                        <h2 className="text-2xl font-bold mb-2 uppercase tracking-wider text-black">Game Finished!</h2>
                        <p className="uppercase tracking-wider mb-4 text-black">Final Scores</p>
                        <div className="space-y-3">
                            {Object.entries(gameState.scores)
                                .sort(([, a], [, b]) => b - a)
                                .map(([playerId, score], index) => (
                                    <div 
                                        key={playerId} 
                                        className="flex items-center justify-between bg-beige border-4 border-black p-4 uppercase tracking-wider text-black"
                                    >
                                        <span>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                                            {playerId === user?.user_id ? 'You' : `Player ${playerId.slice(0, 8)}`}
                                        </span>
                                        <span className="text-xl font-bold text-black">{score}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}