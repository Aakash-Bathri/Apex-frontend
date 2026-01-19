import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams, useRouteLoaderData } from "react-router";
import { FaTrophy, FaSearch } from "react-icons/fa";
import { getRankInfo } from "~/utils/rankUtils";
import Navbar from "~/components/navbar";

export function meta() {
    return [{ title: "Leaderboard - Apex" }];
}

export default function Leaderboard() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [userPosition, setUserPosition] = useState<any>(null);

    const [filters, setFilters] = useState({
        timeframe: searchParams.get("timeframe") || "all-time",
        filter: "global",
    });
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Get user data from protected layout
    const userData = useRouteLoaderData("protected-layout");

    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const queryParams = new URLSearchParams({
                limit: "50",
                timeframe: filters.timeframe,
                filter: filters.filter,
                search: search,
            });

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/leaderboard?${queryParams}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();

            setLeaderboard(data.leaderboard || []);
            setUserPosition(data.userPosition || null);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch leaderboard on mount and filter changes
    useEffect(() => {
        fetchLeaderboard();
    }, [filters]);



    const handleFilterChange = (timeframe: string) => {
        setFilters({ ...filters, timeframe });
        setSearchParams({ timeframe });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLeaderboard();
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const userRank = userData?.stats?.overall?.rating
        ? getRankInfo(userData.stats.overall.rating).rank
        : { name: "Newbie", color: "text-gray-400", min: 0, max: 799 };

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white">
            {/* Background Ambience */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Navbar */}
            <Navbar data={userData} rank={userRank} handleLogout={handleLogout} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FaTrophy className="text-yellow-400 text-3xl" />
                        <h1 className="text-4xl font-black">Leaderboard</h1>
                    </div>
                    <p className="text-white/40 text-sm">
                        Global ranked players · Updated after every match
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Time Filters */}
                        <div className="flex gap-2 flex-wrap">
                            {["all-time", "monthly", "weekly"].map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => handleFilterChange(tf)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.timeframe === tf
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {tf.charAt(0).toUpperCase() + tf.slice(1).replace("-", " ")}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search username..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                            >
                                <FaSearch />
                            </button>
                        </form>
                    </div>
                </div>

                {/* User Position Card (if not in top 50) */}
                {userPosition && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-2xl font-black text-purple-400">#{userPosition.rank}</div>
                                <div>
                                    <div className="font-bold">{userPosition.username}</div>
                                    <div className={`text-sm ${getRankInfo(userPosition.rating).rank.color}`}>
                                        {getRankInfo(userPosition.rating).rank.name}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black">{userPosition.rating}</div>
                                <div className="text-xs text-white/40">Your Rank</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trust Signal */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-6 text-center text-sm text-white/40">
                    ✓ All ranked games affect leaderboard · Rating updates are transparent
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Rank</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-white/60 uppercase tracking-wider">Rating</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-white/60 uppercase tracking-wider">Games</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-white/60 uppercase tracking-wider">Win %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                                            No players found
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboard.map((entry) => {
                                        const rankInfo = getRankInfo(entry.rating);
                                        return (
                                            <tr
                                                key={entry.userId}
                                                className={`border-b border-white/5 transition-colors ${entry.isCurrentUser
                                                    ? "bg-blue-500/10 hover:bg-blue-500/20"
                                                    : "hover:bg-white/5"
                                                    }`}
                                            >
                                                <td className="px-4 py-3 text-white/80 font-mono">#{entry.rank}</td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        to={`/profile/${entry.username}`}
                                                        className="font-semibold hover:text-blue-400 transition-colors"
                                                    >
                                                        {entry.username}
                                                    </Link>
                                                </td>
                                                <td className={`px-4 py-3 font-bold ${rankInfo.rank.color}`}>
                                                    {rankInfo.rank.name}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-white">
                                                    {entry.rating}
                                                </td>
                                                <td className="px-4 py-3 text-right text-white/80">{entry.games}</td>
                                                <td className="px-4 py-3 text-right text-green-400 font-semibold">
                                                    {entry.winRate}%
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


            </main>
        </div>
    );
}
