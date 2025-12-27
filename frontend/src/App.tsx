import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LobbyPage from "./pages/LobbyPage";
import GameRoomPage from "./pages/GameRoomPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { StripePatterns } from "./components/StripePatterns";

function App() {
    return (
        <BrowserRouter>
            <StripePatterns />
            <Routes>
                <Route path="/" element={<WelcomePage />} />
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;
