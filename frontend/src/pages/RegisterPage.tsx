import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import Modal from "../components/Modal";
import { useModalWithContent } from "../hooks/useModal";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const register = useAuthStore((state) => state.register);
    const navigate = useNavigate();
    const errorModal = useModalWithContent<string>();

    useEffect(() => {
        document.title = 'SET Game - Register';
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(username, email, password);
            navigate("/lobby");
        } catch (err) {
            const errorMsg = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message || "Registration Failed"
                : err instanceof Error
                ? err.message
                : "Registration Failed";
            errorModal.open(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-beige p-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-bold text-center uppercase tracking-wider text-black">Register</h2>
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
                            minLength={3}
                            maxLength={20}
                            pattern="[a-zA-Z0-9_]+"
                            className="block w-full px-4 py-3 border-4 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium uppercase tracking-wider mb-1 text-black">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            minLength={6}
                            className="block w-full px-4 py-3 border-4 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-4 border-4 border-black text-white bg-set-purple hover:bg-[#5500AA] uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        style={{ color: '#ffffff', backgroundColor: '#6600CC' }}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p className="text-center text-sm uppercase tracking-wider text-black">
                    Already have an account?{" "}
                    <Link to="/login" className="text-set-green hover:underline font-semibold">
                        Login
                    </Link>
                </p>
            </div>

            {/* Error Modal */}
            {errorModal.content && (
                <Modal
                    isOpen={errorModal.isOpen}
                    onClose={errorModal.close}
                    title="Registration Error"
                    type="error"
                >
                    <p className="uppercase tracking-wider text-black mb-4">{errorModal.content}</p>
                    <button
                        onClick={errorModal.close}
                        className="w-full px-6 py-3 bg-set-red hover:bg-[#AA0000] border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-white"
                        style={{ color: '#ffffff', backgroundColor: '#CC0000' }}
                    >
                        Close
                    </button>
                </Modal>
            )}
        </div>
    );
}
