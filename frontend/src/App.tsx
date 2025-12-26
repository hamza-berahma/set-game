import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LobbyPage from "./pages/LobbyPage";
import GameRoomPage from "./pages/GameRoomPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/lobby"
                    element={
                        <ProtectedRoute>
                            <LobbyPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/game/:roomId"
                    element={
                        <ProtectedRoute>
                            <GameRoomPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
