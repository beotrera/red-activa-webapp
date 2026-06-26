import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NNStatus, Gender } from "../types";
import { usePersons } from "../hooks/useApi";
import { getImageUrl } from "../utils/api";
import PulseLoader from "../components/PulseLoader";
import { Search, PlusCircle, Hospital, MapPin, FileText, Camera, X } from "lucide-react";

const GENDER_LABEL: Record<Gender, string> = {
  [Gender.MALE]: "Masculino",
  [Gender.FEMALE]: "Femenino",
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
        <PulseLoader className="h-12 w-12 text-[#991b1b]" />
        <p className="text-sm text-slate-400 font-medium">Cargando expedientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Búsqueda e Inteligencia de Coincidencias en Pacientes NN
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Examine ingresos no identificados, verifique sus coincidencias y firme la homologación judicial del caso.
            </p>
          </div>
          <button
            onClick={() => navigate("/admision")}
            className="bg-[#991b1b] hover:bg-red-900 text-white font-semibold text-sm px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Admitir Paciente NN
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por hospital, barrio, marcas corporales, rasgos particulares..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | NNStatus)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">Ver: Todos los Casos</option>
            <option value={NNStatus.UNIDENTIFIED}>Ver: Sin Identificar aún</option>
            <option value={NNStatus.POTENTIAL_MATCH}>Ver: Con Coincidencias</option>
            <option value={NNStatus.IDENTIFIED}>Ver: Resueltos / Identificados</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-sm italic">
            No se registraron coincidencias médicas con el filtro seleccionado.
          </div>
        ) : (
          filtered.map((ad) => (
            <div
              key={ad.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                ad.status === NNStatus.IDENTIFIED
                  ? "border-emerald-200"
                  : ad.status === NNStatus.POTENTIAL_MATCH
                  ? "border-amber-300 ring-1 ring-amber-200"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="p-4 sm:p-5 space-y-3">

                {/* Row 1: Status icon + Title + Badge */}
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg border shrink-0 ${
                      ad.status === NNStatus.IDENTIFIED
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : ad.status === NNStatus.POTENTIAL_MATCH
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    <Hospital className="h-4 w-4" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-slate-900">
                      NN aprox. {ad.estimatedAgeMin}–{ad.estimatedAgeMax} años ({GENDER_LABEL[ad.gender]})
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        ad.status === NNStatus.IDENTIFIED
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : ad.status === NNStatus.POTENTIAL_MATCH
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {ad.status === NNStatus.IDENTIFIED
                        ? "Identificado"
                        : ad.status === NNStatus.POTENTIAL_MATCH
                        ? "Coincidencia"
                        : "Sin identificar"}
                    </span>
                  </div>
                </div>

                {/* Row 2: Address + Date */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">
                      {ad.address}{ad.neighborhood && ` — ${ad.neighborhood}`}
                    </span>
                  </span>
                  <span>
                    Ingreso: {new Date(ad.dateOfAdmission).toLocaleDateString()} · {ad.reportedBy}
                  </span>
                </div>

                {/* Row 3: Distinctive features */}
                <p className="text-sm text-slate-600 italic leading-relaxed border-t border-slate-100 pt-3">
                  "{ad.distinctiveFeatures}"
                </p>

                {/* Row 4: Photo thumbnails */}
                {ad.identifyingPhotos && ad.identifyingPhotos.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {ad.identifyingPhotos.slice(0, 3).map((photo, pIdx) => (
                      <button
                        type="button"
                        key={pIdx}
                        onClick={() => setLightboxPhoto(photo)}
                        className="group border border-slate-200 rounded-lg overflow-hidden bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer transition hover:border-slate-400"
                      >
                        <div className="relative w-16 h-16 overflow-hidden bg-slate-50">
                          <img
                            src={getImageUrl(photo.url)}
                            alt="Evidencia"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </button>
                    ))}
                    {ad.identifyingPhotos.length > 3 && (
                      <button
                        type="button"
                        onClick={() => navigate(`/nn/${ad.id}`)}
                        className="w-16 h-16 rounded-lg border border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer"
                      >
                        <span className="text-sm font-bold text-slate-500">+{ad.identifyingPhotos.length - 3}</span>
                        <span className="text-xs text-slate-400">más</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Row 5: Metadata + Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>
                      Conciencia:{" "}
                      <span className="text-slate-700 font-medium">{ad.consciousnessLevel}</span>
                    </span>
                    {ad.height != null && (
                      <span>
                        Estatura:{" "}
                        <span className="text-slate-700 font-medium">{ad.height} m</span>
                      </span>
                    )}
                    {ad.weight != null && (
                      <span>
                        Peso:{" "}
                        <span className="text-slate-700 font-medium">{ad.weight} kg</span>
                      </span>
                    )}
                    {ad.assignedTo && (
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {ad.assignedTo}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/nn/${ad.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#991b1b] hover:bg-red-900 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Ver Expediente
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-300">Detalle de evidencia</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-square w-full bg-slate-50 flex items-center justify-center">
              <img
                src={getImageUrl(lightboxPhoto.url)}
                alt="Evidencia médica"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              {lightboxPhoto.uploadedAt && (
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(lightboxPhoto.uploadedAt).toLocaleString()}
                </span>
              )}
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
