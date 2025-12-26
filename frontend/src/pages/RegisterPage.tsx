import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const register = useAuthStore((state) => state.register);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await register(username, email, password);
            navigate("/lobby");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-beige p-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white border-4 border-black shadow-brutal">
                <h2 className="text-3xl font-bold text-center uppercase tracking-wider">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border-4 border-black text-red-700 px-4 py-3 uppercase tracking-wider">
                            {error}
                        </div>
                    )}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium uppercase tracking-wider mb-1"
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
                            className="block w-full px-4 py-3 border-4 border-black bg-white focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium uppercase tracking-wider mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="block w-full px-4 py-3 border-4 border-black bg-white focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium uppercase tracking-wider mb-1"
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
                            className="block w-full px-4 py-3 border-4 border-black bg-white focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-4 border-4 border-black text-white bg-set-purple hover:bg-purple-700 shadow-brutal uppercase tracking-wider font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p className="text-center text-sm uppercase tracking-wider">
                    Already have an account?{" "}
                    <Link to="/login" className="text-set-green hover:underline font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
