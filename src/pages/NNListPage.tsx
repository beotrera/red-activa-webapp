import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NNStatus, Gender } from "../types";
import { usePersons } from "../hooks/useApi";
import { getImageUrl } from "../utils/api";
import PulseLoader from "../components/PulseLoader";
import { Search, PlusCircle, Hospital, ChevronRight, Camera, X } from "lucide-react";

const GENDER_LABEL: Record<Gender, string> = {
  [Gender.MALE]: "Masc.",
  [Gender.FEMALE]: "Fem.",
};

const CONSCIOUSNESS_LABEL: Record<string, string> = {
  CONSCIOUS: "Consciente",
  DISORIENTED: "Desorientado",
  UNCONSCIOUS: "Inconsciente",
  SEDATED: "Sedado",
};

const STATUS_META: Record<NNStatus, { label: string; badgeClass: string; dotColor: string; rowBorder: string }> = {
  [NNStatus.UNIDENTIFIED]: {
    label: "Sin identificar",
    badgeClass: "text-slate-500 bg-slate-100 border border-slate-200",
    dotColor: "bg-slate-400",
    rowBorder: "border-l-slate-200",
  },
  [NNStatus.POTENTIAL_MATCH]: {
    label: "Coincidencia detectada",
    badgeClass: "text-amber-700 bg-amber-50 border border-amber-200",
    dotColor: "bg-amber-400",
    rowBorder: "border-l-amber-400",
  },
  [NNStatus.IDENTIFIED]: {
    label: "Identificado",
    badgeClass: "text-emerald-700 bg-emerald-50 border border-emerald-200",
    dotColor: "bg-emerald-500",
    rowBorder: "border-l-emerald-400",
  },
};

type LightboxPhoto = { url: string; caption?: string; uploadedAt?: string };

export default function NNListPage() {
  const navigate = useNavigate();
  const { data: admissions = [], isLoading } = usePersons(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | NNStatus>("all");
  const [lightboxPhoto, setLightboxPhoto] = useState<LightboxPhoto | null>(null);

  const filtered = admissions.filter((ad) => {
    const s = `${ad.address} ${ad.neighborhood} ${ad.distinctiveFeatures} ${ad.estimatedAgeMin}-${ad.estimatedAgeMax} ${ad.gender} ${ad.reportedBy}`.toLowerCase();
    const matchesSearch = s.includes(searchTerm.toLowerCase());
    if (statusFilter === "all") return matchesSearch;
    return ad.status === statusFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <PulseLoader className="h-10 w-10 text-[#991b1b]" />
        <p className="text-sm text-slate-500">Cargando expedientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Main container ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Pacientes No Identificados
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filtered.length} expediente{filtered.length !== 1 ? "s" : ""} · Cotejo y homologación judicial
            </p>
          </div>
          <button
            onClick={() => navigate("/admision")}
            className="inline-flex items-center gap-2 bg-[#991b1b] hover:bg-red-900 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Admitir Paciente NN
          </button>
        </div>

        {/* Search + filter */}
        <div className="px-5 py-3 border-b border-slate-100 flex gap-3 bg-slate-50/60">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por barrio, rasgos, edad, reportado por..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 w-full bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | NNStatus)}
            className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 sm:w-48"
          >
            <option value="all">Todos los estados</option>
            <option value={NNStatus.UNIDENTIFIED}>Sin identificar</option>
            <option value={NNStatus.POTENTIAL_MATCH}>Con coincidencias</option>
            <option value={NNStatus.IDENTIFIED}>Identificados</option>
          </select>
        </div>

        {/* Column headers */}
        <div className="hidden md:flex items-center gap-4 px-5 py-2 border-b border-slate-100 bg-slate-50/40">
          <div className="w-9 shrink-0" />
          <span className="w-36 shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Paciente</span>
          <span className="flex-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rasgos</span>
          <span className="w-28 shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:block">Barrio</span>
          <span className="w-24 shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ingreso</span>
          <span className="w-44 shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Estado</span>
          <div className="w-4 shrink-0" />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">No se encontraron expedientes con los criterios seleccionados.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((ad) => {
              const meta = STATUS_META[ad.status];
              const firstPhoto = ad.identifyingPhotos?.[0];
              const extraPhotos = (ad.identifyingPhotos?.length ?? 0) - 1;

              return (
                <div
                  key={ad.id}
                  onClick={() => navigate(`/nn/${ad.id}`)}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group border-l-2 ${meta.rowBorder}`}
                >
                  {/* Photo thumbnail */}
                  <button
                    type="button"
                    onClick={(e) => {
                      if (!firstPhoto) return;
                      e.stopPropagation();
                      setLightboxPhoto(firstPhoto);
                    }}
                    className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center focus:outline-none"
                  >
                    {firstPhoto ? (
                      <>
                        <img
                          src={getImageUrl(firstPhoto.url)}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {extraPhotos > 0 && (
                          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-white">+{extraPhotos}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <Hospital className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Identity */}
                  <div className="w-36 shrink-0 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                      {ad.estimatedAgeMin}–{ad.estimatedAgeMax} a. · {GENDER_LABEL[ad.gender]}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">#{ad.id.slice(-8)}</p>
                  </div>

                  {/* Distinctive features */}
                  <p className="flex-1 min-w-0 text-xs text-slate-500 truncate">
                    {ad.distinctiveFeatures}
                  </p>

                  {/* Neighborhood */}
                  <p className="w-28 shrink-0 text-xs text-slate-500 truncate hidden lg:block">
                    {ad.neighborhood || "—"}
                  </p>

                  {/* Date */}
                  <div className="w-24 shrink-0 hidden md:block">
                    <p className="text-xs text-slate-600">
                      {new Date(ad.dateOfAdmission).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </p>
                    {ad.consciousnessLevel && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {CONSCIOUSNESS_LABEL[ad.consciousnessLevel] ?? ad.consciousnessLevel}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="w-44 shrink-0 hidden md:flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotColor}`} />
                      {meta.label}
                    </span>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Mostrando {filtered.length} de {admissions.length} expedientes
            </p>
            {filtered.length < admissions.length && (
              <button
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

      </div>

      {/* ── Lightbox ── */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-lg w-full border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <Camera className="h-3.5 w-3.5 text-slate-400" />
                Evidencia fotográfica
              </span>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-square w-full bg-slate-50 flex items-center justify-center">
              <img
                src={getImageUrl(lightboxPhoto.url)}
                alt="Evidencia"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            {lightboxPhoto.uploadedAt && (
              <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(lightboxPhoto.uploadedAt).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
