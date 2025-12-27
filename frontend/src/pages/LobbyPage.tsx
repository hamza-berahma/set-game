import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Plus, Users } from 'lucide-react';
import RoomSettingsModal from '../components/RoomSettingsModal';
import type { RoomSettings } from '../components/RoomSettingsModal';
import Modal from '../components/Modal';
import { useModal } from '../hooks/useModal';

export default function LobbyPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const settingsModal = useModal();
  const errorModal = useModal();
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateRoom = (settings: RoomSettings) => {
    const newRoomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    navigate(`/game/${newRoomId}`, {
      state: { settings }
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/game/${roomId.trim()}`);
    } else {
      setErrorMessage('Please enter a room ID');
      errorModal.open();
    }
  };

  return (
    <div className="min-h-screen bg-beige p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-8 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl uppercase tracking-wider mb-1 text-black">Welcome, {user?.username}!</h1>
              <p className="uppercase text-sm tracking-widest text-gray-600 text-black">Game Lobby</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-set-red hover:bg-red-700 text-white border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105"
              style={{ color: '#ffffff', backgroundColor: '#CC0000' }}
            >
              Logout
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Create New Room */}
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl uppercase tracking-wider mb-4 text-black">Create New Game</h2>
              <p className="text-gray-600 mb-4 uppercase text-sm tracking-wider text-black">
                Start a new game room and share the room ID with friends.
              </p>
              <button
                onClick={settingsModal.open}
                className="w-full px-6 py-4 bg-set-green hover:bg-[#008800] text-white border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-lg"
                style={{ color: '#ffffff', backgroundColor: '#00AA00' }}
              >
                <Plus className="inline w-5 h-5 mr-2" style={{ stroke: '#ffffff' }} />
                Create New Room
              </button>
            </div>

            {/* Join Existing Room */}
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl uppercase tracking-wider mb-4 text-black">Join Existing Game</h2>
              <p className="text-gray-600 mb-4 uppercase text-sm tracking-wider text-black">
                Enter a room ID to join an existing game.
              </p>
              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID (e.g., room-abc123)"
                  className="flex-1 px-4 py-3 border-4 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                />
                <button
                  type="submit"
                  disabled={!roomId.trim()}
                  className="px-6 py-3 bg-set-purple hover:bg-[#5500AA] text-white border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold"
                  style={{ 
                    color: !roomId.trim() ? '#000000' : '#ffffff',
                    backgroundColor: !roomId.trim() ? '#9CA3AF' : '#6600CC'
                  }}
                >
                  <Users className="inline w-5 h-5 mr-2" style={{ stroke: !roomId.trim() ? '#000000' : '#ffffff' }} />
                  Join Room
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Room Settings Modal */}
      <RoomSettingsModal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.close}
        onSave={handleCreateRoom}
      />

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => {
          errorModal.close();
          setErrorMessage("");
        }}
        title="Error"
        type="error"
      >
        {errorMessage && (
          <>
            <p className="uppercase tracking-wider text-black">{errorMessage}</p>
            <button
              onClick={() => {
                errorModal.close();
                setErrorMessage("");
              }}
              className="mt-4 w-full px-6 py-3 bg-set-red hover:bg-[#AA0000] border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-white"
              style={{ color: '#ffffff', backgroundColor: '#CC0000' }}
            >
              Close
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}