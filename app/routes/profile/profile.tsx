import {
  FaUser,
  FaTrophy,
  FaChartLine,
  FaHistory,
  FaGamepad,
  FaFire,
  FaShieldAlt,
  FaMedal,
  FaCode,
  FaSignOutAlt,
} from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import Navbar from "~/components/navbar";

import { RANKS, getRankInfo } from "~/utils/rankUtils";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<any>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch profile data by username
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/profile/${username}`
        );
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  // Fetch current logged-in user data (for navbar)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setCurrentUserData(data))
        .catch(() => { });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] text-white flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#0a0e27] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="text-2xl font-bold mb-2">User Not Found</div>
          <div className="text-white/60 mb-6">@{username} doesn't exist</div>
          <Link
            to="/leaderboard"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
          >
            Browse Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  const user = profileData.user;
  const stats = profileData.stats?.overall || {};
  const topics = profileData.stats?.topics || {};
  const matches = profileData.matches || [];
  const ratingHistory = profileData.ratingHistory || [];

  const rating = stats.rating || 0;
  const { rank, nextRank, progress, pointsToNext } = getRankInfo(rating);
  const totalGames = (stats.wins || 0) + (stats.losses || 0);
  const winRate =
    totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  // Transform Topics for Radar Chart
  const topicData = Object.keys(topics).map((key) => ({
    subject: key,
    A: topics[key]?.rating || 1000,
    fullMark: 2000,
  }));

  const currentUserRank = currentUserData?.stats?.overall?.rating
    ? getRankInfo(currentUserData.stats.overall.rating).rank
    : { name: "Newbie", color: "text-gray-400", min: 0, max: 799 };

  // Check if current user is viewing their own profile
  const isOwner = currentUserData?.user?.name?.toLowerCase() === user?.name?.toLowerCase();

  // Ensure graph has at least one point (current rating) if history is empty
  const graphData =
    ratingHistory.length > 0
      ? ratingHistory.map((h: any) => ({
        ...h,
        date: new Date(h.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      }))
      : [{ date: "Now", rating: rating }];



  return (
    <div className="min-h-screen bg-[#0a0e27] text-white selection:bg-cyan-500/30 overflow-x-hidden relative pb-12">
      <Navbar data={currentUserData} rank={currentUserRank} handleLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10 space-y-8">
        {/* 1. Profile Header */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-1">
              <div className="w-full h-full rounded-full bg-[#0a0e27] flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white/20">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {/* Rank Badge absolute */}
            <div className="absolute -bottom-2 -right-2 bg-[#0a0e27] p-1.5 rounded-full">
              <FaMedal className={`w-8 h-8 ${rank.color}`} />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              {user?.name || "Player"}
            </h1>
            <div className={`text-xl font-medium mb-4 ${rank.color}`}>
              {rank.name}
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:items-end">
              <div>
                <div className="text-sm text-white/50 mb-1 uppercase tracking-wider font-semibold">
                  Current Rating
                </div>
                <div className="text-4xl font-black text-white">{rating}</div>
              </div>

              {nextRank && (
                <div className="flex-1 w-full max-w-md">
                  <div className="flex justify-between text-xs mb-2 text-white/50 uppercase tracking-widest font-semibold">
                    <span>Rank Progress</span>
                    <span>
                      {pointsToNext} PTS to {nextRank.name}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FaGamepad />}
            label="Total Games"
            value={totalGames}
            color="text-blue-400"
          />
          <StatCard
            icon={<FaTrophy />}
            label="Wins"
            value={stats.wins || 0}
            color="text-green-400"
          />
          <StatCard
            icon={<FaChartLine />}
            label="Win Rate"
            value={`${winRate}%`}
            color="text-cyan-400"
          />
          <StatCard
            icon={<FaFire />}
            label="Current Streak"
            value={stats.currentStreak || 0}
            color="text-orange-400"
          />
        </div>

        {/* 3. Rating Graph & Performance Breakdown */}
        {/* 3. Rating Graph (Full Width) */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 relative">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaChartLine className="text-cyan-400" /> Rating History
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <XAxis
                  dataKey="date"
                  stroke="#aaaaaa"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#aaaaaa"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e2235', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0a0e27', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Split Row: Topic Analysis + Match History */}
        <div className={`grid grid-cols-1 ${isOwner ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-6`}>
          {/* Topic Analysis (1/3 width on LG, 1/2 on MD) */}
          <div className={`${isOwner ? 'md:col-span-1 lg:col-span-1' : ''} bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 relative flex flex-col items-center`}>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 w-full">
              <FaCode className="text-purple-400" /> Topic Analysis
            </h3>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={topicData}>
                  <PolarGrid stroke="#ffffff20" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 2000]} tick={false} axisLine={false} />
                  <Radar
                    name="Rating"
                    dataKey="A"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e2235', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Match History - Owner Only */}
          {isOwner && (
            <div className="md:col-span-1 lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaHistory className="text-white/60" /> Recent Matches
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {matches.length === 0 ? (
                  <div className="text-center py-12 text-white/30">
                    No matches played yet. Start competing to see history!
                  </div>
                ) : (
                  matches.map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${match.result === 'win' ? 'bg-green-500/10 text-green-400' :
                          match.result === 'loss' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                          {match.result === 'win' ? 'W' : match.result === 'loss' ? 'L' : 'D'}
                        </div>
                        <div>
                          <div className="font-semibold">{match.opponent.name}</div>
                          <div className="text-xs text-white/40 flex items-center gap-2">
                            <span>{match.topic}</span>
                            <span>•</span>
                            <span>{new Date(match.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`font-mono font-bold ${match.ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {match.ratingChange > 0 ? '+' : ''}{match.ratingChange}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Privacy Settings - Owner Only */}
        {isOwner && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                <FaShieldAlt size={20} />
              </div>
              <div>
                <h4 className="font-bold">Privacy Settings</h4>
                <p className="text-sm text-white/50">Control who can see your stats</p>
              </div>
            </div>
            {/* Simple Toggle Mock */}
            <div className="flex bg-black/20 p-1 rounded-xl">
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium shadow-sm">Public</button>
              <button className="px-4 py-2 rounded-lg text-white/40 text-sm font-medium hover:text-white transition-colors">Friends Only</button>
            </div>
          </div>
        )}

      </main >
    </div >
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 flex flex-col justify-center gap-1 hover:bg-white/10 transition-colors group">
      <div className={`${color} mb-2 opacity-80 group-hover:scale-110 transition-transform origin-left`}>
        {icon}
      </div>
      <div className="text-2xl md:text-3xl font-bold">{value}</div>
      <div className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}
