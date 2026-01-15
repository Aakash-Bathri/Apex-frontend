import { useState } from "react";
import { useNavigate, useRouteLoaderData } from "react-router";
import {
  FaGamepad,
  FaLock,
  FaKeyboard,
  FaTrophy,
  FaChartLine,
  FaHistory,
} from "react-icons/fa";
import Navbar from "~/components/navbar";
import { RANKS, getRankInfo } from "~/utils/rankUtils";

const CATEGORIES: Record<string, string[]> = {
  "CS": ["DSA", "OOPS", "OS", "DBMS", "CN"],
};

export default function Dashboard() {
  const data = useRouteLoaderData("protected-layout");
  const navigate = useNavigate();

  // UI State
  const [overlay, setOverlay] = useState<null | "public" | "private" | "join">(null);
  const [selectedCategory, setSelectedCategory] = useState("CS");
  const [selectedTopic, setSelectedTopic] = useState("RANDOM");

  // Data extraction
  const rating = data?.stats?.overall?.rating || 0;
  const { rank, nextRank, progress, pointsToNext } = getRankInfo(rating);
  const wins = data?.stats?.overall?.wins || 0;
  const losses = data?.stats?.overall?.losses || 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const currentTopics = CATEGORIES[selectedCategory];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Ambient Background Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar */}
      <Navbar data={data} rank={rank} handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">

          {/* Player Stats Card (Left - 2/3) */}
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
                <div className={`text-4xl md:text-5xl font-black mb-1 ${rank.color}`}>
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
                <div className="text-xl md:text-2xl font-bold text-green-400">{wins}</div>
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

          {/* New Game Setup (Right - 1/3) */}
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCategory === cat
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
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${selectedTopic === "RANDOM"
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
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${selectedTopic === topic
                      ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                      : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                      }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={() => setOverlay("public")}
                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Play Now</span>
                <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {selectedTopic === "RANDOM" ? `${selectedCategory}` : selectedTopic}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOverlay("private")}
                  className="py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-white/80 text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <FaLock /> Private Room
                </button>
                <button
                  onClick={() => setOverlay("join")}
                  className="py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-white/80 text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <FaKeyboard /> Join Code
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Global Leaderboard Teaser (Unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6 h-56 md:h-64 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/20">
              <FaHistory size={20} className="md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-white mb-1">
              Match History
            </h3>
            <p className="text-white/40 text-xs md:text-sm max-w-xs">
              Recent matches will appear here once you start playing.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6 h-56 md:h-64 flex flex-col items-center justify-center text-center relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
            <h3 className="text-base md:text-lg font-medium text-white mb-4 md:mb-6">
              Global Leaderboard
            </h3>

            <div className="space-y-2 md:space-y-3 w-full max-w-xs relative z-10">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5"
                >
                  <span className="font-mono text-sm md:text-base text-cyan-500">#{i}</span>
                  <div className="w-16 md:w-20 h-1.5 md:h-2 bg-white/10 rounded-full" />
                  <div className="ml-auto w-6 md:w-8 h-1.5 md:h-2 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/leaderboard")}
              className="mt-4 md:mt-6 text-xs md:text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-2"
            >
              View All Rankings <FaChartLine />
            </button>
          </div>
        </div>
      </main>

      {/* Overlays */}
      {overlay && (
        <Overlay onClose={() => setOverlay(null)}>
          {overlay === "public" && (
            <PublicOverlay
              topic={selectedTopic} // Pass chosen topic
              onClose={() => setOverlay(null)}
              onStart={(id: string) => navigate(`/game/${id}`)}
            />
          )}
          {overlay === "private" && (
            <PrivateOverlay
              topic={selectedTopic} // Pass chosen topic
              onClose={() => setOverlay(null)}
              onCreate={(code: string) => { }}
            />
          )}
          {overlay === "join" && (
            <JoinOverlay
              onClose={() => setOverlay(null)}
              onJoin={(id: string) => navigate(`/game/${id}`)}
            />
          )}
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ children, onClose }: any) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#12162e] border border-white/10 rounded-3xl p-1 w-full max-w-md shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}

function PublicOverlay({ topic, onClose, onStart }: any) {
  const [loading, setLoading] = useState(true); // Start loading immediately

  // Auto-start on mount since topic is already selected
  useState(() => {
    const start = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/game/public`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              topic: topic,
            }),
          }
        );

        if (!res.ok) throw new Error("Failed to start");
        const data = await res.json();
        onStart(data.gameId);
      } catch (error) {
        alert("Failed to start matchmaking");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    start();
  });

  return (
    <div className="text-center w-full max-w-sm mx-auto">
      <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
      </div>

      <h2 className="text-xl font-bold mb-2">Finding Match...</h2>
      <p className="text-white/50 text-sm mb-6">
        Looking for an opponent in <span className="text-white font-bold">{topic}</span>
      </p>

      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

function PrivateOverlay({ topic, onClose, onCreate: parentOnCreate }: any) {
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const create = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/game/private`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Now passing topic if backend supports it for private games
          // Assuming backend might need update, but sending it doesn't hurt or is required
          body: JSON.stringify({
            topic: topic
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to create");
      const data = await res.json();
      setCreatedCode(data.code);
    } catch (error) {
      alert("Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  if (createdCode) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaLock size={28} />
        </div>
        <h2 className="text-xl font-bold mb-2">Game Created!</h2>
        <p className="text-white/50 text-sm mb-6">
          Topic: <span className="text-white font-bold">{topic}</span><br />
          Share this code with your friend to start.
        </p>

        <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-8">
          <div className="text-3xl font-mono font-bold tracking-[0.2em] text-cyan-400 select-all">
            {createdCode}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaLock size={28} />
      </div>
      <h2 className="text-xl font-bold mb-2">Create Private Room</h2>
      <p className="text-white/50 text-sm mb-8">
        Create a private <span className="text-white font-bold">{topic}</span> room.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={create}
          disabled={loading}
          className="flex-1 py-3.5 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Room"}
        </button>
      </div>
    </div>
  );
}

function JoinOverlay({ onClose, onJoin }: any) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/game/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      if (!res.ok) throw new Error("Failed to join");
      const data = await res.json();
      onJoin(data.gameId);
    } catch (error) {
      alert("Invalid code or full room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaKeyboard size={28} />
      </div>
      <h2 className="text-xl font-bold mb-2">Join Game</h2>
      <p className="text-white/50 text-sm mb-8">
        Enter the 6-digit code shared by your friend.
      </p>

      <input
        type="text"
        placeholder="ENTER CODE"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-center text-xl font-mono font-bold tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500 transition-colors mb-8"
        maxLength={6}
      />

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={join}
          disabled={loading || code.length < 6}
          className="flex-1 py-3.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Joining..." : "Join Game"}
        </button>
      </div>
    </div>
  );
}
