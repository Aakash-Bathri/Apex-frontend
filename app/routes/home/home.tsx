import { useNavigate, Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { FaCode, FaLock, FaChartLine, FaTrophy, FaTerminal } from "react-icons/fa";
import { RANKS } from "~/utils/rankUtils";

export function meta() {
  return [{ title: "Apex - Real-time Coding Battles" }];
}

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white selection:bg-cyan-500/30 font-sans">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-black">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
          APEX
        </div>
        <button
          onClick={handleGetStarted}
          className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-lg shadow-white/10 cursor-pointer"
        >
          Get Started
        </button>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-cyan-400 tracking-widest uppercase animate-pulse">
          Only Ranked Matches
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
          Compete. Climb.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Prove your skill.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Real ratings. Real stakes.
          No practice mode. No casual wins.
          Only victory moves you up the ranks.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 w-full md:w-auto cursor-pointer"
          >
            Get Started
          </button>
          <Link
            to="/leaderboard"
            className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-lg rounded-xl transition-all w-full md:w-auto flex items-center justify-center gap-2"
          >
            View Leaderboard
          </Link>
        </div>
      </section>

      {/* 2. Differentiation (Principles) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PrincipleCard
            icon={<FaTrophy className="text-yellow-400" />}
            title="Only Ranked"
            desc="Every game affects your rating. No meaningless matches."
          />
          <PrincipleCard
            icon={<FaChartLine className="text-cyan-400" />}
            title="CF-Style Ranks"
            desc="Newbie to Grandmaster. Transparent ELO system."
          />
          <PrincipleCard
            icon={<FaLock className="text-purple-400" />}
            title="Private Duels"
            desc="Create a lobby. Share code. 1v1 your friends."
          />
          <PrincipleCard
            icon={<FaCode className="text-green-400" />}
            title="Real History"
            desc="Detailed match logs and rating graphs. No black box."
          />
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            <Step
              num="01"
              title="Sign In"
              desc="Use GitHub or Google. Instant access."
              align="left"
            />
            <Step
              num="02"
              title="Choose Mode"
              desc="Queue for Public matchmaking or create Private room."
              align="right"
            />
            <Step
              num="03"
              title="Duel"
              desc="Solve DSA/CS problems faster than your opponent."
              align="left"
            />
            <Step
              num="04"
              title="Climb"
              desc="Win to gain rating. Lose and drop. Simple."
              align="right"
            />
          </div>
        </div>
      </section>

      {/* 4. Rank Ladder Teaser & Preview Combined */}
      <RankClimbSection />


      {/* 7. Final CTA */}
      <section className="relative z-10 py-24 text-center">
        <div className="absolute inset-0 bg-blue-600/5 blur-[100px] pointer-events-none" />
        <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10">Ready to compete?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <button
            onClick={handleGetStarted}
            className="px-10 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </section>

    </div>
  );
}

function PrincipleCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
      <div className="text-2xl mb-4 bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc, align }: any) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#0a0e27] border-2 border-blue-500/30 flex items-center justify-center text-xl md:text-2xl font-black text-blue-400 relative z-10 shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
        {num}
      </div>
      <div className={`text-center md:text-left ${align === 'right' ? 'md:text-right' : ''} max-w-xs`}>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/50">{desc}</p>
      </div>
    </div>
  )
}


function RankClimbSection() {
  // Emoji mapping for ranks to match the centralized RANKS system
  const RANK_EMOJIS: Record<string, string> = {
    "Newbie": "🌱",
    "Pupil": "📚",
    "Specialist": "⭐",
    "Expert": "🎯",
    "Candidate Master": "💎",
    "Master": "👑",
    "International Master": "👑",
    "Grandmaster": "🏆"
  };

  const [rating, setRating] = useState(800);
  const [complete, setComplete] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer to detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Fetch user data if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUserData(data);
          setIsLoggedIn(true);
        })
        .catch(() => {
          setIsLoggedIn(false);
        });
    }
  }, []);

  // Animation effect - only runs when section is visible
  useEffect(() => {
    if (!isVisible) return; // Don't start animation until visible

    let interval: any;
    const targetRating = isLoggedIn && userData?.stats?.overall?.rating
      ? userData.stats.overall.rating
      : 2400;

    const startRating = 800;

    // Delay start slightly
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setRating((prev) => {
          if (prev >= targetRating) {
            clearInterval(interval);
            setComplete(true);
            return targetRating;
          }
          // Climb logic: Mostly up, sometimes down
          const change = Math.random() > 0.2 ? Math.floor(Math.random() * 15) + 5 : -Math.floor(Math.random() * 10);
          return Math.max(startRating, Math.min(targetRating, prev + change));
        });
      }, 50);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isLoggedIn, userData, isVisible]);

  const currentRank = RANKS.slice().reverse().find((r) => rating >= r.min) || RANKS[0];

  // Get user display data
  const displayName = isLoggedIn && userData?.user?.name ? userData.user.name : "Alex_Dev";
  const displayAvatar = isLoggedIn && userData?.user?.avatar ? userData.user.avatar : null;
  const displayInitial = displayName[0]?.toUpperCase() || "A";
  const wins = isLoggedIn && userData?.stats?.overall?.wins ? userData.stats.overall.wins : 0;
  const losses = isLoggedIn && userData?.stats?.overall?.losses ? userData.stats.overall.losses : 0;
  const totalGames = wins + losses || 142;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 68;

  return (
    <section ref={sectionRef} className="relative z-10 py-24 bg-gradient-to-b from-transparent to-black/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center">

          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-black mb-2 text-center">
            Start as a Newbie. <br />
            <span className="text-purple-400">End as a Grandmaster.</span>
          </h2>
          <p className="text-white/40 mb-12 text-center">The climb is hard. That's the point.</p>

          {/* Horizontal Rank Ladder */}
          <div className="relative w-full max-w-4xl mb-16">
            {/* Connecting Line */}
            <div className="absolute left-0 right-0 top-6 h-0.5 bg-white/5" />

            <div className="flex justify-between items-start relative">
              {RANKS.map((r) => {
                const isActive = currentRank.name === r.name;
                const isPassed = rating >= r.min;

                return (
                  <div key={r.name} className="flex flex-col items-center gap-3 relative">
                    <div className={`w-3 h-3 rounded-full z-10 transition-all duration-300 ${isPassed ? "bg-cyan-500 shadow-[0_0_10px_cyan]" : "bg-white/10"} ${isActive ? "scale-150" : ""}`} />
                    <div className={`font-mono font-bold text-center transition-all duration-300 ${r.color} ${isActive ? "text-base scale-110" : "text-xs opacity-50"}`}>
                      {r.name.split(" ")[0]}<br />{r.name.split(" ")[1] || ""}
                    </div>
                    {isActive && <div className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/60 tabular-nums whitespace-nowrap">{rating}</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Live Card - Centered */}
          <div className="relative max-w-lg w-full">
            <div className={`transition-all duration-500 transform ${complete ? "scale-110 shadow-[0_0_50px_rgba(239,68,68,0.4)]" : "rotate-1 hover:rotate-0"}`}>
              <div className="bg-[#12162e] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {complete && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-1000">
                    <div className="text-center animate-bounce">
                      <div className="text-6xl mb-2">{RANK_EMOJIS[currentRank.name] || "🏆"}</div>
                      <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{currentRank.name.toUpperCase()}</h3>
                      <p className="text-white/80 font-mono mt-2">
                        {currentRank.name === "Grandmaster" ? "LEGENDARY STATUS" :
                          currentRank.name === "Master" ? "ELITE TIER" :
                            currentRank.name === "Candidate Master" ? "RISING STAR" :
                              currentRank.name === "Expert" ? "SKILLED PLAYER" :
                                currentRank.name === "Specialist" ? "FOCUSED MIND" :
                                  currentRank.name === "Pupil" ? "LEARNING JOURNEY" : "NEW BEGINNING"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-colors duration-300 ${complete ? `${currentRank.color.replace('text-', 'bg-')}/20 ${currentRank.color}` : "bg-blue-500/20 text-blue-400"}`}>
                        {complete ? (RANK_EMOJIS[currentRank.name] || "🏆") : displayInitial}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-lg">{displayName}</div>
                      <div className={`text-sm font-bold transition-colors duration-300 ${currentRank.color}`}>
                        {currentRank.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tabular-nums">
                    {rating}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Fake Graph Visual */}
                  <div className="h-24 flex items-end gap-1 pb-2 border-b border-white/5">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-white/10 hover:bg-cyan-400/50 transition-colors rounded-t-sm"
                        style={{
                          height: `${Math.min(100, Math.max(10, (rating / 2400) * 100 + (Math.random() * 40 - 20)))}%`,
                          opacity: 0.3 + (i / 20) * 0.7
                        }}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/40 mb-1">Win Rate</div>
                      <div className="text-xl font-bold text-green-400">{winRate}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/40 mb-1">Matches</div>
                      <div className="text-xl font-bold text-white">{totalGames}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

