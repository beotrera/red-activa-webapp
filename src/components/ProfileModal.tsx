import { X, Mail, Building2, ShieldCheck, LogOut, FileText, Sparkles, UserCheck } from "lucide-react";
import { RedActivaUser, UserRole } from "../types";
import { getDisplayName } from "../utils/userPrefix";

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.DOCTOR]: "Médico/a",
  [UserRole.NURSE]: "Enfermero/a",
  [UserRole.ADMINISTRATOR]: "Administrador/a",
  [UserRole.SOCIAL_WORKER]: "Trabajador/a Social",
  [UserRole.PSYCHOLOGIST]: "Psicólogo/a",
};

const MOCKED_STATS = [
  { icon: FileText, label: "Expedientes", value: 12 },
  { icon: Sparkles, label: "Coincidencias", value: 3 },
  { icon: UserCheck, label: "Identificados", value: 1 },
];

interface ProfileModalProps {
  user: RedActivaUser;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({ user, onClose, onLogout }: ProfileModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" />

      {/* Panel */}
      <div
        className="relative w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red accent top */}
        <div className="h-1 bg-[#991b1b]" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Avatar + name */}
        <div className="flex flex-col items-center px-6 pt-6 pb-5 text-center">
          <div className="relative mb-3">
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face"}
              alt={user.fullName}
              className="h-20 w-20 rounded-2xl border-2 border-slate-200 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 border-2 border-white rounded-full h-4 w-4" title="Activo" />
          </div>
          <h2 className="text-base font-black text-slate-900 leading-tight">
            {getDisplayName(user)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{ROLE_LABEL[user.role]}</p>
        </div>

        {/* Info rows */}
        <div className="mx-4 mb-4 bg-slate-50 rounded-xl divide-y divide-slate-100 border border-slate-100">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600 truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600 truncate">{user.entity}</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600">{ROLE_LABEL[user.role]}</span>
          </div>
        </div>

        {/* Mocked stats */}
        <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
          {MOCKED_STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl py-3">
              <Icon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-lg font-black text-slate-900">{value}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="px-4 pb-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
