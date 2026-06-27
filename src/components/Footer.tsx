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
        <p className="text-xs text-slate-400">
          República Argentina · Ministerio de Salud, Justicia y Seguridad
        </p>
      </div>
    </footer>
  );
}
