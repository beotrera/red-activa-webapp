import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Users, FileText, MapPin, ChevronRight, AlertTriangle } from "lucide-react";
import { useNeighborhoodStats } from "../hooks/useApi";
import PulseLoader from "../components/PulseLoader";
import type { NeighborhoodStat } from "../types";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const CABA_CENTER: [number, number] = [-34.6037, -58.3816];

function neighborhoodIcon(nn: number): L.DivIcon {
  const bg = nn >= 3 ? "#991b1b" : nn >= 1 ? "#d97706" : "#94a3b8";
  const label = nn > 0 ? String(nn) : "·";
  return L.divIcon({
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
    html: `<div style="width:34px;height:34px;background:${bg};border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:800;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.28);">${label}</div>`,
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: neighborhoods = [], isLoading } = useNeighborhoodStats();

  const { totalNN, totalReports, activeBarrios, withCoincidencias } = useMemo(() => ({
    totalNN: neighborhoods.reduce((s, n) => s + n.nn, 0),
    totalReports: neighborhoods.reduce((s, n) => s + n.reports, 0),
    activeBarrios: neighborhoods.filter((n) => n.nn > 0).length,
    withCoincidencias: neighborhoods.filter((n) => n.nn > 0 && n.reports > 0).length,
  }), [neighborhoods]);

  const mappable = neighborhoods.filter((n) => n.coordinates != null);
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Map */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
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
            <div className="flex-1 min-h-95">
              <MapContainer
                center={CABA_CENTER}
                zoom={12}
                scrollWheelZoom
                className="h-full w-full min-h-95"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mappable.map((n) => (
                  <Marker
                    key={n.neighborhood}
                    position={[n.coordinates![1], n.coordinates![0]]}
                    icon={neighborhoodIcon(n.nn)}
                  >
                    <Popup>
                      <div className="text-xs space-y-1.5 min-w-32.5">
                        <p className="font-bold text-slate-900 text-sm">{n.neighborhood}</p>
                        {n.comuna != null && (
                          <p className="text-slate-400 text-[11px]">Comuna {n.comuna}</p>
                        )}
                        <div className="flex gap-4 pt-1 border-t border-slate-100">
                          <span>
                            NNA: <strong className="text-[#991b1b]">{n.nn}</strong>
                          </span>
                          <span>
                            Reportes: <strong className="text-amber-700">{n.reports}</strong>
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Actividad por barrio
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ordenado por NNA activos
              </p>
            </div>
            <button
              onClick={() => navigate("/nn")}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Ver todos
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {neighborhoods.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-5 py-10">
              <p className="text-sm text-slate-400 text-center">No hay datos disponibles.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {neighborhoods.map((n) => (
                <NeighborhoodRow key={n.neighborhood} n={n} maxNN={maxNN} maxReports={maxReports} />
              ))}
            </div>
          )}
        </div>

      </div>
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
