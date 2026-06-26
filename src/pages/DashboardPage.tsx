import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FileText, MapPin, ChevronRight, AlertTriangle, Search } from "lucide-react";
import { useNeighborhoodStats } from "../hooks/useApi";
import PulseLoader from "../components/PulseLoader";
import CabaMap from "../components/CabaMap";
import type { NeighborhoodStat } from "../types";


export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: neighborhoods = [], isLoading } = useNeighborhoodStats();

  const { totalNN, totalReports, activeBarrios, withCoincidencias } = useMemo(() => ({
    totalNN: neighborhoods.reduce((s, n) => s + n.nn, 0),
    totalReports: neighborhoods.reduce((s, n) => s + n.reports, 0),
    activeBarrios: neighborhoods.filter((n) => n.nn > 0).length,
    withCoincidencias: neighborhoods.filter((n) => n.nn > 0 && n.reports > 0).length,
  }), [neighborhoods]);

  const maxNN = Math.max(...neighborhoods.map((n) => n.nn), 1);
  const maxReports = Math.max(...neighborhoods.map((n) => n.reports), 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <PulseLoader className="h-10 w-10 text-[#991b1b]" />
        <p className="text-sm text-slate-500">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          value={totalNN}
          label="NNA registrados"
          sublabel="Personas no identificadas"
          color="red"
          Icon={Users}
          onClick={() => navigate("/nn")}
          clickLabel="Ver expedientes"
        />
        <KpiCard
          value={totalReports}
          label="Reportes ciudadanos"
          sublabel="Personas desaparecidas"
          color="amber"
          Icon={FileText}
        />
        <KpiCard
          value={activeBarrios}
          label="Barrios con NNA"
          sublabel={`de ${neighborhoods.length} relevados`}
          color="slate"
          Icon={MapPin}
        />
        <KpiCard
          value={withCoincidencias}
          label="Cruces activos"
          sublabel="Barrios con NNA y reportes"
          color="orange"
          Icon={AlertTriangle}
        />
      </div>

      {/* ── Map + Table side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:h-135">

        {/* Map */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Distribución geográfica
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Círculo = NNA activos · color por urgencia
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#991b1b] inline-block" /> ≥3 NNA
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> 1–2 NNA
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Solo reportes
                </span>
              </div>
            </div>
          </div>

          {neighborhoods.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-95">
              <p className="text-sm text-slate-400">No hay datos disponibles.</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <CabaMap neighborhoods={neighborhoods} />
            </div>
          )}
        </div>

        {/* Table */}
        <NeighborhoodTable
          neighborhoods={neighborhoods}
          maxNN={maxNN}
          maxReports={maxReports}
          onVerTodos={() => navigate("/nn")}
        />

      </div>
    </div>
  );
}

// ── Neighborhood Table ────────────────────────────────────────────────────────

type SortOption = "activity" | "nn-desc" | "nn-asc" | "reports-desc" | "reports-asc" | "name-asc";

function NeighborhoodTable({
  neighborhoods,
  maxNN,
  maxReports,
  onVerTodos,
}: {
  neighborhoods: NeighborhoodStat[];
  maxNN: number;
  maxReports: number;
  onVerTodos: () => void;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("activity");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = q
      ? neighborhoods.filter((n) => n.neighborhood.toLowerCase().includes(q))
      : [...neighborhoods];

    return list.sort((a, b) => {
      switch (sort) {
        case "nn-desc":    return b.nn - a.nn;
        case "nn-asc":     return a.nn - b.nn;
        case "reports-desc": return b.reports - a.reports;
        case "reports-asc":  return a.reports - b.reports;
        case "name-asc":   return a.neighborhood.localeCompare(b.neighborhood);
        default:           return (b.nn + b.reports) - (a.nn + a.reports);
      }
    });
  }, [neighborhoods, search, sort]);

  return (
    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0 flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide shrink-0">
          Por barrio
        </h2>
        <button
          onClick={onVerTodos}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
        >
          Ver todos <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Search + sort */}
      <div className="px-3 py-2.5 border-b border-slate-100 shrink-0 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar barrio..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-600 cursor-pointer"
        >
          <option value="activity">Actividad</option>
          <option value="nn-desc">NNA ↓</option>
          <option value="nn-asc">NNA ↑</option>
          <option value="reports-desc">Reportes ↓</option>
          <option value="reports-asc">Reportes ↑</option>
          <option value="name-asc">Nombre A–Z</option>
        </select>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <p className="text-xs text-slate-400">
            {search ? `Sin resultados para "${search}"` : "No hay datos disponibles."}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.map((n) => (
            <NeighborhoodRow key={n.neighborhood} n={n} maxNN={maxNN} maxReports={maxReports} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  red:    { num: "text-[#991b1b]", bg: "bg-red-50",    border: "border-red-100",    icon: "text-[#991b1b]" },
  amber:  { num: "text-amber-700", bg: "bg-amber-50",  border: "border-amber-100",  icon: "text-amber-600" },
  slate:  { num: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200",  icon: "text-slate-500" },
  orange: { num: "text-orange-700",bg: "bg-orange-50", border: "border-orange-100", icon: "text-orange-500" },
};

interface KpiCardProps {
  value: number;
  label: string;
  sublabel: string;
  color: keyof typeof COLOR_MAP;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  clickLabel?: string;
}

function KpiCard({ value, label, sublabel, color, Icon, onClick, clickLabel }: KpiCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div
      onClick={onClick}
      className={`bg-white border ${c.border} rounded-xl p-4 shadow-sm flex flex-col gap-3 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow group" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className={`${c.bg} ${c.icon} p-2 rounded-lg`}>
          <Icon className="h-4 w-4" />
        </div>
        {onClick && (
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors mt-0.5" />
        )}
      </div>
      <div>
        <p className={`text-3xl font-extrabold ${c.num} leading-none`}>
          {value.toLocaleString("es-AR")}
        </p>
        <p className="text-xs font-semibold text-slate-700 mt-1.5 leading-tight">{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{sublabel}</p>
      </div>
      {onClick && clickLabel && (
        <p className={`text-[11px] font-semibold ${c.icon} group-hover:underline`}>{clickLabel} →</p>
      )}
    </div>
  );
}

// ── Neighborhood row ──────────────────────────────────────────────────────────

function NeighborhoodRow({
  n,
  maxNN,
  maxReports,
}: {
  n: NeighborhoodStat;
  maxNN: number;
  maxReports: number;
}) {
  return (
    <div className="px-5 py-3 space-y-2 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800">{n.neighborhood}</span>
        {n.comuna != null && (
          <span className="text-[10px] text-slate-400 font-mono">C{n.comuna}</span>
        )}
      </div>

      {/* NNA bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 w-14 shrink-0">NNA</span>
        <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#991b1b] h-full rounded-full transition-all"
            style={{ width: `${(n.nn / maxNN) * 100}%` }}
          />
        </div>
        <span className={`text-[11px] font-bold w-4 text-right shrink-0 ${n.nn > 0 ? "text-[#991b1b]" : "text-slate-300"}`}>
          {n.nn}
        </span>
      </div>

      {/* Reports bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 w-14 shrink-0">Reportes</span>
        <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all"
            style={{ width: `${(n.reports / maxReports) * 100}%` }}
          />
        </div>
        <span className={`text-[11px] font-bold w-4 text-right shrink-0 ${n.reports > 0 ? "text-amber-600" : "text-slate-300"}`}>
          {n.reports}
        </span>
      </div>
    </div>
  );
}
