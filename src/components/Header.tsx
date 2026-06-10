import React, { useEffect, useState } from "react";
import { Activity, Bell, Shield, Radio, Wifi, Clock, LogOut, KeyRound } from "lucide-react";
import { SystemAlert, RedActivaUser } from "../types";
import { getDisplayName } from "../utils/userPrefix";

interface HeaderProps {
  alerts: SystemAlert[];
  onAlertClick: () => void;
  onMarkAllRead: () => void;
  currentUser: RedActivaUser | null;
  onLogout: () => void;
}

export default function Header({ alerts, onAlertClick, onMarkAllRead, currentUser, onLogout }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const unreadCount = alerts.filter(a => !a.read).length;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 shadow-sm relative z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#991b1b] to-[#7f1d1d] text-white p-2 md:p-2.5 rounded-xl shadow-md border-b-2 border-red-950 relative overflow-hidden">
            {/* Pulsating Emergency Pulse */}
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Activity className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 font-sans">
                <span className="text-[#991b1b]">Red</span>
                <span className="text-slate-900 font-light tracking-wide">Activa</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 tracking-wider font-semibold uppercase mt-0.5">
              Conectando Vidas en Tiempo Real
            </p>
          </div>
        </div>

        {/* Real-time Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          
          {/* Virtual Clock */}
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono text-slate-600">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{time.toLocaleTimeString()}</span>
            <span className="hidden md:inline text-slate-350">| 2026-06-02</span>
          </div>

          {/* Active User Credentials Badge */}
          {currentUser && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"}
                alt={currentUser.fullName}
                className="h-10 w-10 rounded-xl border border-slate-300 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="hidden lg:block text-left">
                <p className="text-sm font-extrabold text-slate-900 leading-none">{getDisplayName(currentUser)}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-[#991b1b] hover:bg-red-50 rounded-lg cursor-pointer transition duration-150"
                title="Cerrar sesión institucional"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
