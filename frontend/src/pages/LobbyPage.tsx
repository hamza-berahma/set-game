import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function LobbyPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Game Lobby</h2>
            <p className="text-gray-600">This is where you'll join or create games.</p>
            {/* Need to add some like, room creation and joining, imma sleep for now */}
          </div>
        </div>
      </div>
    </div>
  );
}