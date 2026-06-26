import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NNStatus, Gender } from "../types";
import { usePersons } from "../hooks/useApi";
import { getImageUrl } from "../utils/api";
import PulseLoader from "../components/PulseLoader";
import { Search, PlusCircle, Hospital, MapPin, ChevronRight, Camera, X } from "lucide-react";

const GENDER_LABEL: Record<Gender, string> = {
  [Gender.MALE]: "Masculino",
  [Gender.FEMALE]: "Femenino",
};

const STATUS_BADGE: Record<NNStatus, { label: string; className: string }> = {
  [NNStatus.UNIDENTIFIED]: {
    label: "SIN IDENTIFICAR",
    className: "text-slate-600 bg-white border border-slate-300",
  },
  [NNStatus.POTENTIAL_MATCH]: {
    label: "COINCIDENCIA DETECTADA",
    className: "text-amber-800 bg-amber-50 border border-amber-300",
  },
  [NNStatus.IDENTIFIED]: {
    label: "IDENTIFICADO",
    className: "text-emerald-800 bg-emerald-50 border border-emerald-300",
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
    const searchString = `${ad.address} ${ad.neighborhood} ${ad.distinctiveFeatures} ${ad.estimatedAgeMin}-${ad.estimatedAgeMax} ${ad.gender} ${ad.reportedBy}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
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
    <div className="space-y-5">

      {/* ── Toolbar ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Registro de Pacientes No Identificados
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Búsqueda, cotejo y homologación judicial · {filtered.length} expediente{filtered.length !== 1 ? "s" : ""} activo{filtered.length !== 1 ? "s" : ""}
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
        <div className="px-5 py-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por dirección, barrio, rasgos, edad, reportado por..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | NNStatus)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 sm:w-52"
          >
            <option value="all">Todos los estados</option>
            <option value={NNStatus.UNIDENTIFIED}>Sin identificar</option>
            <option value={NNStatus.POTENTIAL_MATCH}>Con coincidencias</option>
            <option value={NNStatus.IDENTIFIED}>Identificados</option>
          </select>
        </div>
      </div>

      {/* ── Expediente list ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-14 text-center">
          <p className="text-sm text-slate-400">No se encontraron expedientes con los criterios seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ad) => {
            const badge = STATUS_BADGE[ad.status];
            return (
              <div
                key={ad.id}
                className="bg-white border border-slate-200 rounded-xl hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-150 group"
              >
                <div className="p-4 sm:p-5">

                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 shrink-0">
                        <Hospital className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-snug">
                          Paciente NN · {ad.estimatedAgeMin}–{ad.estimatedAgeMax} años · {GENDER_LABEL[ad.gender]}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{ad.address}{ad.neighborhood && ` — ${ad.neighborhood}`}</span>
                          </span>
                          <span className="text-xs text-slate-400">
                            Ingresó el {new Date(ad.dateOfAdmission).toLocaleDateString("es-AR")} · {ad.reportedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">#{ad.id.slice(-8)}</span>
                    </div>
                  </div>

                  {/* Distinctive features */}
                  <p className="text-xs text-slate-600 italic leading-relaxed pl-10 mb-3 border-l border-slate-200 ml-5">
                    {ad.distinctiveFeatures}
                  </p>

                  {/* Photos */}
                  {ad.identifyingPhotos && ad.identifyingPhotos.length > 0 && (
                    <div className="pl-10 mb-3 flex items-center gap-2 flex-wrap">
                      {ad.identifyingPhotos.slice(0, 3).map((photo, pIdx) => (
                        <button
                          type="button"
                          key={pIdx}
                          onClick={() => setLightboxPhoto(photo)}
                          className="group/img border border-slate-200 rounded-lg overflow-hidden bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer transition-colors"
                        >
                          <div className="w-14 h-14 overflow-hidden">
                            <img
                              src={getImageUrl(photo.url)}
                              alt="Evidencia"
                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </button>
                      ))}
                      {ad.identifyingPhotos.length > 3 && (
                        <button
                          type="button"
                          onClick={() => navigate(`/nn/${ad.id}`)}
                          className="w-14 h-14 rounded-lg border border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 flex flex-col items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-400">+{ad.identifyingPhotos.length - 3}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Footer row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2 pl-10 text-xs text-slate-500">
                      <span>Conciencia: <strong className="text-slate-700 font-semibold">{ad.consciousnessLevel}</strong></span>
                      {ad.height != null && <span>· {ad.height} m</span>}
                      {ad.weight != null && <span>· {ad.weight} kg</span>}
                      {ad.assignedTo && (
                        <span className="text-xs font-semibold text-slate-600 border border-slate-300 bg-slate-50 px-2 py-0.5 rounded">
                          {ad.assignedTo}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/nn/${ad.id}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#991b1b] hover:text-red-900 transition-colors cursor-pointer"
                    >
                      Ver expediente completo
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

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
                <span className="text-xs text-slate-400 font-mono">{new Date(lightboxPhoto.uploadedAt).toLocaleString()}</span>
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
