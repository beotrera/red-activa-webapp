import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Activity, Clock, LayoutDashboard, FolderOpen, UserPlus } from "lucide-react";
import { RedActivaUser } from "../types";
import { getDisplayName } from "../utils/userPrefix";
import ProfileModal from "./ProfileModal";

interface HeaderProps {
  currentUser: RedActivaUser | null;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { to: "/",         label: "Panel",       Icon: LayoutDashboard, matchPrefix: null },
  { to: "/nn",       label: "Expedientes", Icon: FolderOpen,      matchPrefix: "/nn" },
  { to: "/admision", label: "Admitir NN",  Icon: UserPlus,        matchPrefix: "/admision" },
];

export default function Header({ currentUser, onLogout }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(to: string, matchPrefix: string | null): boolean {
    if (matchPrefix) return location.pathname.startsWith(matchPrefix);
    return location.pathname === to;
  }

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
  <>
    <header className="bg-white border-b border-slate-200 shadow-sm relative z-40">
      <div className="h-1 bg-[#991b1b]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-6">

          {/* Branding */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="bg-[#991b1b] text-white p-1.5 rounded-lg border-b-2 border-red-950 relative overflow-hidden shrink-0">
              <span className="absolute top-0.5 right-0.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-300"></span>
              </span>
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Red<span className="text-[#991b1b]">Activa</span>
              </span>
              <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-semibold leading-none">
                Sistema Federal · Personas NN
              </span>
            </div>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map(({ to, label, Icon, matchPrefix }) => {
              const active = isActive(to, matchPrefix);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-slate-400"}`} />
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>{time.toLocaleTimeString("es-AR")}</span>
              <span className="text-slate-300 mx-0.5">·</span>
              <span>{time.toLocaleDateString("es-AR")}</span>
            </div>

            {/* User */}
            {currentUser && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"}
                    alt={currentUser.fullName}
                    className="h-8 w-8 rounded-lg border border-slate-300 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{getDisplayName(currentUser)}</p>
                  </div>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-2.5 -mt-0.5">
          {NAV_ITEMS.map(({ to, label, Icon, matchPrefix }) => {
            const active = isActive(to, matchPrefix);
            return (
              <NavLink
                key={to}
                to={to}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-slate-400"}`} />
                {label}
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>

    {profileOpen && currentUser && (
      <ProfileModal
        user={currentUser}
        onClose={() => setProfileOpen(false)}
        onLogout={() => { setProfileOpen(false); onLogout(); }}
      />
    )}
  </>
  );
}
