import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import GameBoard from '../components/GameBoard';
import { useSocket } from '../hooks/useSocket';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores/authStore';
import type { GameState, RoomSettings } from '../types/game';
import ProfileAvatar from '../components/ProfileAvatar';
import BotAvatar from '../components/BotAvatar';
import EventChat, { type GameEvent } from '../components/EventChat';
import GameEndModal from '../components/GameEndModal';
import { useModal } from '../hooks/useModal';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

export default function GameRoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { socket, isConnected, error: socketError } = useSocket();
    const { user } = useAuthStore();
    
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const toast = useToast();
    const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
    const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
    const [finalScores, setFinalScores] = useState<Record<string, number> | null>(null);
    const gameEndModal = useModal();
    
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const roomSettings = (location.state as { settings?: RoomSettings })?.settings;
    const hasJoinedRef = useRef(false);
    const lastRoomIdRef = useRef<string | null>(null);

    useEffect(() => {
        document.title = `SET Game - Room ${roomId || ''}`;
        
        const storedRoomId = sessionStorage.getItem('lastRoomId');
        if (storedRoomId && storedRoomId !== roomId) {
            sessionStorage.removeItem('lastRoomId');
        }
    }, [roomId]);

    const addEvent = useCallback((event: Omit<GameEvent, 'id' | 'timestamp'>) => {
        setGameEvents((prev) => [
            ...prev,
            {
                ...event,
                id: `${Date.now()}-${Math.random()}`,
                timestamp: new Date(),
            },
        ]);
    }, []);

    useEffect(() => {
        if (socket) {
            socketService.setSocket(socket);
        }
        return () => {
            socketService.disconnect();
        };
    }, [socket]);

    useEffect(() => {
        if (socket && isConnected && roomId && !hasJoinedRef.current) {
            lastRoomIdRef.current = roomId;
            sessionStorage.setItem('lastRoomId', roomId);
            
            socketService.joinRoom(roomId, {
                playWithBots: roomSettings?.playWithBots ?? true,
                maxPlayers: roomSettings?.maxPlayers,
                timerDuration: roomSettings?.timerDuration,
            });
            hasJoinedRef.current = true;
            setTimeout(() => {
                addEvent({
                    type: 'game_started',
                    message: 'Game started!',
                });
            }, 0);
        }
        return () => {
            if (roomId) {
                hasJoinedRef.current = false;
                socketService.leaveRoom();
                // Reset timer when leaving room
                setTimeRemaining(null);
            }
        };
    }, [socket, isConnected, roomId, addEvent, roomSettings]);

    useEffect(() => {
        if (socket && isConnected && !hasJoinedRef.current) {
            const storedRoomId = sessionStorage.getItem('lastRoomId');
            if (storedRoomId && storedRoomId === roomId) {
                socketService.reconnect(storedRoomId);
            }
        }
    }, [socket, isConnected, roomId]);

    useEffect(() => {
        socketService.setHandlers({
            onGameStateUpdate: (state: GameState) => {
                setGameState(state);
                setIsProcessing(false);
                state.players.forEach(playerId => {
                    if (!playerNames[playerId] && playerId !== user?.user_id && playerId.startsWith('bot-')) {
                        setPlayerNames(prev => ({
                            ...prev,
                            [playerId]: 'Bot',
                        }));
                    }
                });
            },
            onSetFound: (data) => {
                if (data.playerId === user?.user_id) {
                    addEvent({
                        type: 'set_found',
                        message: `You found a SET! +${data.newScore} points`,
                        playerId: data.playerId,
                        playerName: data.playerUsername,
                    });
                } else {
                    addEvent({
                        type: 'set_found',
                        message: `${data.playerUsername} found a SET!`,
                        playerId: data.playerId,
                        playerName: data.playerUsername,
                    });
                    toast.showToast(`${data.playerUsername} found a SET!`, 'info');
                }
            },
            onPlayerJoined: (data) => {
                setPlayerNames(prev => ({
                    ...prev,
                    [data.playerId]: data.username,
                }));
                addEvent({
                    type: 'player_joined',
                    message: `${data.username} joined the game`,
                    playerId: data.playerId,
                    playerName: data.username,
                });
                toast.showToast(`${data.username} joined the game`, 'info');
            },
            onPlayerLeft: (data) => {
                addEvent({
                    type: 'player_left',
                    message: `${data.username} left the game`,
                    playerId: data.playerId,
                    playerName: data.username,
                });
                toast.showToast(`${data.username} left the game`, 'info');
            },
            onGameEnded: (data) => {
                setFinalScores(data.scores);
                addEvent({
                    type: 'game_ended',
                    message: 'Game ended!',
                });
                gameEndModal.open();
            },
            onTimerStart: (data) => {
                // Initialize timer display when timer starts
                setTimeRemaining(data.duration || 0);
            },
            onTimerUpdate: (data) => {
                // Update timer display with remaining time from backend
                if (data.remaining !== undefined && data.remaining !== null) {
                    setTimeRemaining(data.remaining);
                }
            },
            onTimerEnd: () => {
                setTimeRemaining(0);
                addEvent({
                    type: 'game_ended',
                    message: 'Time\'s up!',
                });
            },
            onError: (error) => {
                addEvent({
                    type: 'error',
                    message: error.message,
                });
                toast.showToast(error.message, 'error');
                setIsProcessing(false);
            },
        });
    }, [user, toast, addEvent, playerNames, gameEndModal, roomSettings, timeRemaining]);

    const handleCardSelect = (cardIds: string[]) => {
        if (!roomId || !socket || !isConnected) {
            toast.showToast('Not connected to server', 'error');
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

    const handleExit = () => {
        if (socket && roomId) {
            socketService.leaveRoom();
        }
        navigate('/lobby');
    };

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
                <div className="mb-6">
                    <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl font-bold uppercase tracking-wider text-black">Game Room: {roomId}</h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-set-green border-2 border-black"></div>
                                    <span className="text-sm uppercase tracking-wider text-black">Connected</span>
                                </div>
                                <button
                                    onClick={handleExit}
                                    className="px-4 py-2 bg-set-red hover:bg-[#AA0000] text-white border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold flex items-center gap-2"
                                    style={{ color: '#ffffff', backgroundColor: '#CC0000' }}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Exit
                                </button>
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

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-6">
                        <GameBoard
                            cards={cards}
                            onCardSelect={handleCardSelect}
                            isProcessing={isProcessing}
                        />
                        
                        <EventChat 
                            events={gameEvents} 
                            currentUserId={user?.user_id}
                        />
                    </div>

                    {gameState && gameState.players.length > 0 && (
                        <div>
                            {(timeRemaining !== null || (roomSettings?.timerDuration && roomSettings.timerDuration > 0)) && (
                                <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-4">
                                    <h3 className="text-lg uppercase tracking-widest mb-4 text-black">Timer</h3>
                                    <div className={`border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                        (timeRemaining ?? roomSettings?.timerDuration ?? 0) < 30 ? 'bg-set-red' : 
                                        (timeRemaining ?? roomSettings?.timerDuration ?? 0) < 60 ? 'bg-gold' : 'bg-white'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-sm uppercase tracking-wider font-semibold ${
                                                (timeRemaining ?? roomSettings?.timerDuration ?? 0) < 30 ? 'text-white' : 'text-black'
                                            }`}>
                                                Time Remaining
                                            </span>
                                        </div>
                                        <div className={`text-2xl font-bold ${
                                            (timeRemaining ?? roomSettings?.timerDuration ?? 0) < 30 ? 'text-white' : 'text-black'
                                        }`}>
                                            {formatTime(timeRemaining ?? roomSettings?.timerDuration ?? 0)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-4">
                                <h3 className="text-lg uppercase tracking-widest mb-4 text-black">Players</h3>
                                <div className="space-y-3">
                                    {gameState.players.map((playerId) => {
                                        const isBot = playerId.startsWith('bot-');
                                        const isCurrentUser = playerId === user?.user_id;
                                        const playerName = playerNames[playerId] || (isBot ? 'Bot' : `Player ${playerId.slice(0, 8)}`);
                                        
                                        return (
                                            <div
                                                key={playerId}
                                                className={`border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                                    isCurrentUser
                                                        ? 'bg-gold'
                                                        : isBot
                                                        ? 'bg-beige'
                                                        : 'bg-white'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    {isBot ? (
                                                        <BotAvatar 
                                                            botId={playerId}
                                                            botName={playerName}
                                                            size="medium"
                                                        />
                                                    ) : (
                                                        <ProfileAvatar 
                                                            userId={playerId} 
                                                            size="medium"
                                                        />
                                                    )}
                                                    <span className="text-sm uppercase tracking-wider font-semibold text-black">
                                                        {isCurrentUser ? 'You' : playerName}
                                                    </span>
                                                </div>
                                                <div className="text-2xl font-bold text-black">
                                                    {gameState.scores[playerId] || 0} pts
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

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
                                            {playerId.startsWith('bot-') ? (
                                                <BotAvatar 
                                                    botId={playerId}
                                                    botName={playerNames[playerId] || 'Bot'}
                                                    size="medium"
                                                />
                                            ) : (
                                                <ProfileAvatar 
                                                    userId={playerId} 
                                                    size="medium"
                                                />
                                            )}
                                            <span>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                                                {playerId === user?.user_id ? 'You' : playerNames[playerId] || `Player ${playerId.slice(0, 8)}`}
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold text-black">{score}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

                {gameState && finalScores && (
                    <GameEndModal
                        isOpen={gameEndModal.isOpen}
                        onClose={gameEndModal.close}
                        scores={finalScores}
                        players={gameState.players}
                        currentUserId={user?.user_id}
                        playerNames={playerNames}
                    />
                )}
            </div>
        </div>
    );
}