import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Plus, Users } from 'lucide-react';

export default function LobbyPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateRoom = () => {
    const newRoomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    navigate(`/game/${newRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/game/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-beige p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-8 border-black p-6 shadow-brutal-xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl uppercase tracking-wider mb-1">Welcome, {user?.username}!</h1>
              <p className="uppercase text-sm tracking-widest text-gray-600">Game Lobby</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-set-red hover:bg-red-700 text-white border-4 border-black uppercase tracking-wider shadow-brutal transition-all hover:scale-105"
            >
              Logout
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Create New Room */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal">
              <h2 className="text-xl uppercase tracking-wider mb-4">Create New Game</h2>
              <p className="text-gray-600 mb-4 uppercase text-sm tracking-wider">
                Start a new game room and share the room ID with friends.
              </p>
              <button
                onClick={handleCreateRoom}
                className="w-full px-6 py-4 bg-set-green hover:bg-green-600 text-white border-4 border-black uppercase tracking-wider shadow-brutal transition-all hover:scale-105 font-semibold text-lg"
              >
                <Plus className="inline w-5 h-5 mr-2" />
                Create New Room
              </button>
            </div>

            {/* Join Existing Room */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal">
              <h2 className="text-xl uppercase tracking-wider mb-4">Join Existing Game</h2>
              <p className="text-gray-600 mb-4 uppercase text-sm tracking-wider">
                Enter a room ID to join an existing game.
              </p>
              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID (e.g., room-abc123)"
                  className="flex-1 px-4 py-3 border-4 border-black bg-white focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                />
                <button
                  type="submit"
                  disabled={!roomId.trim()}
                  className="px-6 py-3 bg-set-purple hover:bg-purple-700 text-white border-4 border-black uppercase tracking-wider shadow-brutal transition-all hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold"
                >
                  <Users className="inline w-5 h-5 mr-2" />
                  Join Room
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}