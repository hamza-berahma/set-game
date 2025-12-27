import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import Modal from "../components/Modal";
import { useModal } from "../hooks/useModal";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    const errorModal = useModal();

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(username, password);
            navigate("/lobby");
        } catch (err) {
            const errorMsg = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message || "Login Failed"
                : err instanceof Error
                ? err.message
                : "Login Failed";
            setError(errorMsg);
            errorModal.open();
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-beige p-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-bold text-center uppercase tracking-wider text-black">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium uppercase tracking-wider mb-1 text-black"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="block w-full px-4 py-3 border-4 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium uppercase tracking-wider mb-1 text-black"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="block w-full px-4 py-3 border-4 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-4 border-4 border-black text-white bg-set-green hover:bg-[#008800] uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        style={{ color: '#ffffff', backgroundColor: '#00AA00' }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="text-center text-sm uppercase tracking-wider text-black">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-set-purple hover:underline font-semibold">
                        Register
                    </Link>
                </p>
            </div>

            {/* Error Modal */}
            <Modal
                isOpen={errorModal.isOpen}
                onClose={() => {
                    errorModal.close();
                    setError("");
                }}
                title="Login Error"
                type="error"
            >
                {error && (
                    <>
                        <p className="uppercase tracking-wider text-black mb-4">{error}</p>
                        <button
                            onClick={() => {
                                errorModal.close();
                                setError("");
                            }}
                            className="w-full px-6 py-3 bg-set-red hover:bg-[#AA0000] border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-white"
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
