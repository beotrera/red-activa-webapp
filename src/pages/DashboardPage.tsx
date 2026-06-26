import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Users, FileText, MapPin, ChevronRight } from "lucide-react";
import { useNeighborhoodStats } from "../hooks/useApi";
import PulseLoader from "../components/PulseLoader";
import type { LucideIcon } from "lucide-react";

// Fix Leaflet default icon paths broken by Vite asset handling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const CABA_CENTER: [number, number] = [-34.6037, -58.3816];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: neighborhoods = [], isLoading } = useNeighborhoodStats();

  const { totalNN, totalReports } = useMemo(
    () => ({
      totalNN: neighborhoods.reduce((s, n) => s + n.nn, 0),
      totalReports: neighborhoods.reduce((s, n) => s + n.reports, 0),
    }),
    [neighborhoods]
  );

  const mappable = neighborhoods.filter((n) => n.coordinates != null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <PulseLoader className="h-10 w-10 text-[#991b1b]" />
        <p className="text-sm text-slate-500">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Totals ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          Icon={Users}
          label="Total NNA registrados"
          value={totalNN}
          color="text-[#991b1b]"
          bg="bg-red-50"
        />
        <StatCard
          Icon={FileText}
          label="Total reportes ciudadanos"
          value={totalReports}
          color="text-amber-700"
          bg="bg-amber-50"
        />
        <StatCard
          Icon={MapPin}
          label="Barrios relevados"
          value={neighborhoods.length}
          color="text-slate-600"
          bg="bg-slate-100"
        />
      </div>

      {/* ── Map ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Distribución geográfica
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personas NN y reportes por barrio · CABA
            </p>
          </div>
          <button
            onClick={() => navigate("/nn")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            Ver expedientes
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {neighborhoods.length === 0 ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-sm text-slate-400">No hay datos por barrio disponibles.</p>
          </div>
        ) : (
          <div className="h-96">
            <MapContainer
              center={CABA_CENTER}
              zoom={11}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mappable.map((n) => (
                <Marker
                  key={n.neighborhood}
                  position={[n.coordinates![1], n.coordinates![0]]}
                >
                  <Popup>
                    <div className="text-xs space-y-1 min-w-[120px]">
                      <p className="font-bold text-slate-900">{n.neighborhood}</p>
                      {n.comuna != null && (
                        <p className="text-slate-500">Comuna {n.comuna}</p>
                      )}
                      <p>
                        NNA:{" "}
                        <strong className="text-[#991b1b]">{n.nn}</strong>
                      </p>
                      <p>
                        Reportes:{" "}
                        <strong className="text-amber-700">{n.reports}</strong>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* ── Neighborhood table ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Resumen por barrio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ordenado por actividad descendente
          </p>
        </div>

        {neighborhoods.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-slate-400">No hay datos por barrio disponibles.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide">
                    Barrio
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide">
                    Comuna
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide">
                    NNA
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide">
                    Reportes
                  </th>
                </tr>
              </thead>
              <tbody>
                {neighborhoods.map((n, i) => (
                  <tr
                    key={n.neighborhood}
                    className={`border-b border-slate-100 last:border-0 ${
                      i % 2 === 1 ? "bg-slate-50/50" : ""
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {n.neighborhood}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">
                      {n.comuna ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-bold ${
                          n.nn > 0 ? "text-[#991b1b]" : "text-slate-400"
                        }`}
                      >
                        {n.nn}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-bold ${
                          n.reports > 0 ? "text-amber-700" : "text-slate-400"
                        }`}
                      >
                        {n.reports}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

interface StatCardProps {
  Icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  bg: string;
}

function StatCard({ Icon, label, value, color, bg }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
      <div className={`${bg} ${color} p-3 rounded-xl shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-slate-900 leading-none">
          {value.toLocaleString("es-AR")}
        </p>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mt-1 leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}
