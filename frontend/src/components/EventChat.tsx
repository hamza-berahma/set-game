import { useEffect, useRef } from 'react';

export interface GameEvent {
    id: string;
    timestamp: Date;
    type: 'set_found' | 'player_joined' | 'player_left' | 'game_started' | 'game_ended' | 'error';
    message: string;
    playerId?: string;
    playerName?: string;
}

interface EventChatProps {
    events: GameEvent[];
    currentUserId?: string;
}

export default function EventChat({ events, currentUserId }: EventChatProps) {
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [events]);

    const getEventIcon = (type: GameEvent['type']) => {
        switch (type) {
            case 'set_found':
                return '✓';
            case 'player_joined':
                return '→';
            case 'player_left':
                return '←';
            case 'game_started':
                return '▶';
            case 'game_ended':
                return '■';
            case 'error':
                return '!';
            default:
                return '•';
        }
    };

    const getEventColor = (type: GameEvent['type']) => {
        switch (type) {
            case 'set_found':
                return 'text-set-green';
            case 'player_joined':
                return 'text-set-purple';
            case 'player_left':
                return 'text-set-red';
            case 'game_started':
                return 'text-set-green';
            case 'game_ended':
                return 'text-set-red';
            case 'error':
                return 'text-set-red';
            default:
                return 'text-black';
        }
    };

    return (
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 h-64 flex flex-col">
            <h3 className="text-lg uppercase tracking-widest mb-3 text-black">Game Events</h3>
            <div
                ref={chatRef}
                className="flex-1 overflow-y-auto space-y-2 pr-2"
                style={{ scrollbarWidth: 'thin' }}
            >
                {events.length === 0 ? (
                    <p className="text-sm text-gray-500 uppercase tracking-wider text-center py-4">
                        No events yet
                    </p>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className={`text-sm uppercase tracking-wider flex items-start gap-2 ${
                                event.playerId === currentUserId ? 'font-semibold' : ''
                            }`}
                        >
                            <span className={`${getEventColor(event.type)} flex-shrink-0`}>
                                {getEventIcon(event.type)}
                            </span>
                            <span className="text-black flex-1">{event.message}</span>
                            <span className="text-gray-500 text-xs flex-shrink-0">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

