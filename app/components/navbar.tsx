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
            <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              APEX
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="flex items-center gap-3 group">
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
