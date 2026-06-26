import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderOpen, UserPlus } from "lucide-react";

const NAV_ITEMS = [
  { to: "/",         label: "Panel",       Icon: LayoutDashboard },
  { to: "/nn",       label: "Expedientes", Icon: FolderOpen },
  { to: "/admision", label: "Admitir NN",  Icon: UserPlus },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-600">
          RedActiva · Sistema Federal de Detección y Vinculación de Personas
        </p>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "text-slate-900 bg-slate-100"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-3 w-3 ${isActive ? "text-slate-700" : "text-slate-400"}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <p className="text-xs text-slate-400">
          República Argentina · Ministerio de Salud, Justicia y Seguridad
        </p>
      </div>
    </footer>
  );
}
