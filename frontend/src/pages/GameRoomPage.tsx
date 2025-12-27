import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import { useSocket } from '../hooks/useSocket';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores/authStore';
import type { GameState, RoomSettings } from '../types/game';
import Modal from '../components/Modal';
import { useModalWithContent } from '../hooks/useModal';
import ProfileAvatar from '../components/ProfileAvatar';

type Notification = {
    message: string;
    type: 'success' | 'error' | 'info';
};

export default function GameRoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const { socket, isConnected, error: socketError } = useSocket();
    const { user } = useAuthStore();
    
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const notificationModal = useModalWithContent<Notification>();
    
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const roomSettings = (location.state as { settings?: RoomSettings })?.settings;

    useEffect(() => {
        if (socket) {
            socketService.setSocket(socket);
        }
        return () => {
            socketService.disconnect();
        };
    }, [socket]);

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

    useEffect(() => {
        if (roomSettings?.timerDuration && roomSettings.timerDuration > 0 && gameState?.status === 'active') {
            setTimeRemaining(roomSettings.timerDuration);
            
            timerIntervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev === null || prev <= 1) {
                        if (timerIntervalRef.current) {
                            clearInterval(timerIntervalRef.current);
                        }
                        // Timer ended - could emit event to backend
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
            };
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            setTimeRemaining(null);
        }
    }, [roomSettings?.timerDuration, gameState?.status]);

    useEffect(() => {
        socketService.setHandlers({
            onGameStateUpdate: (state: GameState) => {
                setGameState(state);
                setIsProcessing(false);
            },
            onSetFound: (data) => {
                // Success notifications don't show modals - just update game state
                // The score update will be visible in the player list
                if (data.playerId !== user?.user_id) {
                    // Only show info modal for other players' achievements
                    notificationModal.open({
                        message: `${data.playerUsername} found a SET!`,
                        type: 'info',
                    });
                }
            },
            onPlayerJoined: (data) => {
                notificationModal.open({
                    message: `${data.username} joined the game`,
                    type: 'info',
                });
            },
            onPlayerLeft: (data) => {
                notificationModal.open({
                    message: `${data.username} left the game`,
                    type: 'info',
                });
            },
            onGameEnded: () => {
                notificationModal.open({
                    message: 'Game ended!',
                    type: 'info',
                });
            },
            onError: (error) => {
                notificationModal.open({
                    message: error.message,
                    type: 'error',
                });
                setIsProcessing(false);
            },
        });
    }, [user, notificationModal]);

    const handleCardSelect = (cardIds: string[]) => {
        if (!roomId || !socket || !isConnected) {
            notificationModal.open({
                message: 'Not connected to server',
                type: 'error',
            });
            return;
        }

        setIsProcessing(true);
        socketService.selectCards(roomId, cardIds);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
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
                            <div className="flex items-center gap-4 text-sm uppercase tracking-wider text-black flex-wrap">
                                <div>
                                    Status: <span className="font-semibold">{gameState.status}</span>
                                </div>
                                <div>
                                    Players: <span className="font-semibold">{gameState.players.length}</span>
                                    {roomSettings?.maxPlayers && (
                                        <span className="text-black"> / {roomSettings.maxPlayers}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

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
                            {/* Timer Display */}
                            {timeRemaining !== null && (
                                <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-4">
                                    <h3 className="text-lg uppercase tracking-widest mb-4 text-black">Timer</h3>
                                    <div className={`border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                        timeRemaining < 30 ? 'bg-set-red' : 
                                        timeRemaining < 60 ? 'bg-gold' : 'bg-white'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm uppercase tracking-wider font-semibold text-black">
                                                Time Remaining
                                            </span>
                                        </div>
                                        <div className={`text-2xl font-bold ${
                                            timeRemaining < 30 ? 'text-white' : 'text-black'
                                        }`}>
                                            {formatTime(timeRemaining)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Players */}
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
                                            <div className="flex items-center gap-3 mb-2">
                                                <ProfileAvatar 
                                                    userId={playerId} 
                                                    size="medium"
                                                />
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
                                        <div className="flex items-center gap-3">
                                            <ProfileAvatar 
                                                userId={playerId} 
                                                size="medium"
                                            />
                                            <span>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                                                {playerId === user?.user_id ? 'You' : `Player ${playerId.slice(0, 8)}`}
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold text-black">{score}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Notification Modal - Only show for error and info, not success */}
                {notificationModal.content && notificationModal.content.type !== 'success' && (
                    <Modal
                        isOpen={notificationModal.isOpen}
                        onClose={notificationModal.close}
                        title={
                            notificationModal.content.type === 'error' ? 'Error' :
                            'Notification'
                        }
                        type={notificationModal.content.type}
                    >
                        <p className="uppercase tracking-wider text-black mb-4">{notificationModal.content.message}</p>
                        <button
                            onClick={notificationModal.close}
                            className={`w-full px-6 py-3 border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-white ${
                                notificationModal.content.type === 'error' ? 'bg-set-red hover:bg-[#AA0000]' :
                                'bg-set-purple hover:bg-[#5500AA]'
                            }`}
                            style={{
                                color: '#ffffff',
                                backgroundColor: notificationModal.content.type === 'error' ? '#CC0000' : '#6600CC'
                            }}
                        >
                            Close
                        </button>
                    </Modal>
                )}
            </div>
        </div>
    );
}