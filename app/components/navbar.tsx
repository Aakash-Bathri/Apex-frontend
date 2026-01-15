import { FaSignOutAlt } from "react-icons/fa";
import type { UserData, RankInfo } from "~/utils/types";
import { Link } from "react-router";

interface NavbarProps {
  data: UserData | undefined;
  rank: RankInfo["rank"];
  handleLogout: () => void;
}

const Navbar = ({ data, rank, handleLogout }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0e27]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
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
            <span className="text-2xl font-black tracking-tighter text-white">APEX</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              Leaderboard
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to={`/profile/${data?.user?.name || 'player'}`} className="flex items-center gap-3 group">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-white/90">
                {data?.user?.name || "Player"}
              </span>
              <span className={`text-xs font-bold ${rank.color}`}>
                {rank.name}
              </span>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 hover:bg-white/10 transition-colors">
              {data?.user?.avatar ? (
                <img
                  src={data.user.avatar}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">
                  {data?.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors ml-2"
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
