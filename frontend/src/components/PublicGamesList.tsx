import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Bot } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

interface PublicRoom {
    room_id: string;
    room_code: string;
    room_name?: string;
    player_count: number;
    lobby_settings: {
        maxPlayers?: number;
        timerDuration?: number;
        playWithBots?: boolean;
        isPrivate?: boolean;
    };
    created_at: string;
}

export default function PublicGamesList() {
    const [rooms, setRooms] = useState<PublicRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        fetchPublicRooms();
        const interval = setInterval(fetchPublicRooms, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchPublicRooms = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rooms/public`);
            setRooms(response.data.rooms || []);
        } catch (error) {
            console.error('Error fetching public rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        if (seconds === 0) return 'No Timer';
        const mins = Math.floor(seconds / 60);
        return `${mins} min${mins !== 1 ? 's' : ''}`;
    };

    const handleJoinRoom = (roomId: string) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate(`/game/${roomId}`);
    };

    if (loading) {
        return (
            <div>
                <h3 className="text-lg uppercase tracking-wider mb-3 text-black">Available Public Games</h3>
                <p className="text-black uppercase tracking-wider text-sm">Loading...</p>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div>
                <h3 className="text-lg uppercase tracking-wider mb-3 text-black">Available Public Games</h3>
                <p className="text-gray-600 uppercase tracking-wider text-sm text-black">No public games available</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg uppercase tracking-wider mb-3 text-black">Available Public Games</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {rooms.map((room) => (
                    <div
                        key={room.room_id}
                        onClick={() => handleJoinRoom(room.room_id)}
                        className="bg-beige border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-1">
                                    {room.room_name || `Room ${room.room_code}`}
                                </h3>
                                <p className="text-xs uppercase tracking-wider text-gray-600 text-black">
                                    Code: {room.room_code}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm uppercase tracking-wider text-black">
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>
                                    {room.player_count} / {room.lobby_settings?.maxPlayers || 8}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(room.lobby_settings?.timerDuration || 0)}</span>
                            </div>
                            {room.lobby_settings?.playWithBots && (
                                <div className="flex items-center gap-1">
                                    <Bot className="w-4 h-4" />
                                    <span>Bots</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

