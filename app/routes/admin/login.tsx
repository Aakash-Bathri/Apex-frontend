import { useState } from "react";
import { useNavigate } from "react-router";

export function meta() {
    return [{ title: "Admin Login - Apex" }];
}

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await res.json();
            localStorage.setItem("adminToken", data.token); // Store separate admin token
            navigate("/admin/dashboard");
        } catch (err) {
            setError("Login failed. Check credentials.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-cyan-400">Admin Access</h1>

                {error && (
                    <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white/60">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="Admin Username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white/60">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
