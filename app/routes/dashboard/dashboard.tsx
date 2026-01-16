import { useState, useEffect } from "react";
import { useNavigate, useRouteLoaderData } from "react-router";
import {
  FaGamepad,
  FaLock,
  FaKeyboard,
  FaTrophy,
  FaChartLine,
  FaHistory,
  FaCrown,
} from "react-icons/fa";
import Navbar from "~/components/navbar";
import { RANKS, getRankInfo } from "~/utils/rankUtils";
import { useSocket } from "~/context/SocketContext";
import {
  Overlay,
  PublicOverlay,
  PrivateOverlay,
  JoinOverlay,
} from "~/components/overlay";

const CATEGORIES: Record<string, string[]> = {
  CS: ["DSA", "OOPS", "OS", "DBMS", "CN"],
};

export default function Dashboard() {
  const data: any = useRouteLoaderData("protected-layout");
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  // UI State
  const [overlay, setOverlay] = useState<null | "public" | "private" | "join">(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState("CS");
  const [selectedTopic, setSelectedTopic] = useState("RANDOM");

  // Data extraction
  const rating = data?.stats?.overall?.rating || 0;
  const { rank, nextRank, progress, pointsToNext } = getRankInfo(rating);
  const wins = data?.stats?.overall?.wins || 0;
  const losses = data?.stats?.overall?.losses || 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const recentMatches = (data?.matches || []).slice(-3);
  console.log(recentMatches);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleGameStart = ({ gameId }: { gameId: string }) => {
      console.log("Game Started! Navigating to:", gameId);
      navigate(`/game/${gameId}`);
    };

    const handleError = ({ message }: { message: string }) => {
      alert(message);
      // Maybe close overlay if error?
    };

    socket.on("game_started", handleGameStart);
    socket.on("match_found", ({ gameId }) => {
      console.log("Match Found! Navigating to:", gameId);
      navigate(`/game/${gameId}`);
    });
    socket.on("error", handleError);

    return () => {
      socket.off("game_started", handleGameStart);
      socket.off("match_found");
      socket.off("error", handleError);
    };
  }, [socket, navigate]);

  // Fetch top leaderboard
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  useEffect(() => {
    const fetchTopLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/leaderboard?page=1&limit=3`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setTopPlayers(data.leaderboard || []);
      } catch (err) {
        console.error("Failed to fetch top players:", err);
      }
    };
    fetchTopLeaderboard();
  }, []);
  // console.log("Top Players:", topPlayers);

  const currentTopics = CATEGORIES[selectedCategory];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white selection:bg-cyan-500/30 overflow-x-hidden relative">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Navbar data={data} rank={rank} handleLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Stats Card */}
          <div className="col-span-1 lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <FaTrophy size={100} className="md:w-[120px] md:h-[120px]" />
            </div>

            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-light text-white/60">
                Current Season
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:items-end mb-6">
              <div>
                <div
                  className={`text-4xl md:text-5xl font-black mb-1 ${rank.color}`}
                >
                  {rating}
                </div>
                <div className="text-base md:text-lg text-white/80 font-medium tracking-wide">
                  {rank.name}
                </div>
              </div>
              {nextRank && (
                <div className="flex-1 w-full max-w-sm pb-1 md:pb-2">
                  <div className="flex justify-between text-[10px] md:text-xs mb-2 text-white/50 uppercase tracking-widest font-semibold">
                    <span>Progress</span>
                    <span>
                      {pointsToNext} PTS to {nextRank.name}
                    </span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4 border-t border-white/5 pt-4 md:pt-6">
              <div>
                <div className="text-xl md:text-2xl font-bold text-white">
                  {totalGames}
                </div>
                <div className="text-[10px] md:text-xs text-white/40 uppercase tracking-wider">
                  Matches
                </div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-green-400">
                  {wins}
                </div>
                <div className="text-[10px] md:text-xs text-white/40 uppercase tracking-wider">
                  Won
                </div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-cyan-400">
                  {winRate}%
                </div>
                <div className="text-[10px] md:text-xs text-white/40 uppercase tracking-wider">
                  Win Rate
                </div>
              </div>
            </div>
          </div>

          {/* New Game Setup */}
          <div className="col-span-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaGamepad className="text-blue-400" /> New Game
            </h3>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {Object.keys(CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedTopic("RANDOM");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Topic Grid */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 content-start">
                <button
                  onClick={() => setSelectedTopic("RANDOM")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedTopic === "RANDOM"
                      ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                      : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                  }`}
                >
                  All
                </button>
                {currentTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      selectedTopic === topic
                        ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                        : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={() => setOverlay("public")}
                disabled={!isConnected}
                className={`w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span>{isConnected ? "Play Now" : "Connecting..."}</span>
                <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {selectedTopic === "RANDOM"
                    ? `${selectedCategory}`
                    : selectedTopic}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOverlay("private")}
                  disabled={!isConnected}
                  className="py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-white/80 text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <FaLock /> Private Room
                </button>
                <button
                  onClick={() => setOverlay("join")}
                  disabled={!isConnected}
                  className="py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-white/80 text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <FaKeyboard /> Join Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* History & Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                <FaHistory className="text-cyan-400" /> Recent Matches
              </h3>
              <button
                onClick={() => navigate(`/profile/${data?.user?.name}`)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentMatches.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">
                  No matches played yet. Start competing!
                </div>
              ) : (
                recentMatches.map((match: any) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          match.result === "win"
                            ? "bg-green-500/10 text-green-400"
                            : match.result === "loss"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {match.result === "win"
                          ? "W"
                          : match.result === "loss"
                            ? "L"
                            : "D"}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {match.opponent?.name || match.opponentId}
                        </div>
                        <div className="text-xs text-white/40">
                          {match.topic}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-mono font-bold text-sm ${
                        match.ratingChange >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {match.ratingChange > 0 ? "+" : ""}
                      {match.ratingChange}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                <FaCrown className="text-yellow-400" /> Top Players
              </h3>
              <button
                onClick={() => navigate("/leaderboard")}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {topPlayers.map((player: any, index: number) => {
                const playerRank = getRankInfo(player.rating).rank;
                return (
                  <div
                    key={player.userId}
                    onClick={() => navigate(`/profile/${player.username}`)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
                  >
                    <span
                      className={`font-mono text-sm font-bold ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : "text-orange-400"}`}
                    >
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {player.username}
                      </div>
                      <div className={`text-xs ${playerRank.color}`}>
                        {playerRank.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm">
                        {player.rating}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {overlay && (
        <Overlay onClose={() => setOverlay(null)}>
          {overlay === "public" && (
            <PublicOverlay
              topic={selectedTopic}
              onClose={() => setOverlay(null)}
              socket={socket}
            />
          )}
          {overlay === "private" && (
            <PrivateOverlay
              topic={selectedTopic}
              onClose={() => setOverlay(null)}
              socket={socket}
            />
          )}
          {overlay === "join" && (
            <JoinOverlay onClose={() => setOverlay(null)} socket={socket} />
          )}
        </Overlay>
      )}
    </div>
  );
}
