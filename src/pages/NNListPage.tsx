import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NNStatus } from "../types";
import { usePersons } from "../hooks/useApi";
import PulseLoader from "../components/PulseLoader";
import { Search, PlusCircle, Hospital, MapPin, FileText, CheckCircle2, Camera, X } from "lucide-react";

type LightboxPhoto = { url: string; uploadedAt?: string };

export default function NNListPage() {
  const navigate = useNavigate();
  const { data: admissions = [], isLoading } = usePersons(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | NNStatus>("all");
  const [lightboxPhoto, setLightboxPhoto] = useState<LightboxPhoto | null>(null);

  const filtered = admissions.filter((ad) => {
    const searchString = `${ad.location} ${ad.distinctiveFeatures} ${ad.estimatedAge} ${ad.gender} ${ad.reportedBy}`.toLowerCase();
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
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
              Búsqueda e Inteligencia de Coincidencias en Pacientes NN
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Examine ingresos no identificados, verifique sus coincidencias y firme la homologación judicial del caso.
            </p>
          </div>
          <button
            onClick={() => navigate("/admision")}
            className="bg-red-50 hover:bg-red-100 text-[#991b1b] border border-red-200 font-bold text-sm px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2 shrink-0"
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
              placeholder="Filtrar por hospital, marcas corporales, rasgos particulares..."
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
      <div className="space-y-4">
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
                  ? "border-emerald-200 bg-slate-50/40 opacity-90"
                  : ad.status === NNStatus.POTENTIAL_MATCH
                  ? "border-amber-300 ring-1 ring-amber-200 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="p-4 sm:p-5 flex items-start gap-4">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    ad.status === NNStatus.IDENTIFIED
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : ad.status === NNStatus.POTENTIAL_MATCH
                      ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <Hospital className="h-5 w-5" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-950">
                      NN de aprox. {ad.estimatedAge} años ({ad.gender})
                    </h4>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        ad.status === NNStatus.IDENTIFIED
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : ad.status === NNStatus.POTENTIAL_MATCH
                          ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {ad.status === NNStatus.IDENTIFIED ? "✓ IDENTIFICADO" : ad.status === NNStatus.POTENTIAL_MATCH ? "🔍 COINCIDENCIA" : "SIN IDENTIFICAR"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" /> {ad.location}
                  </p>
                  <p className="text-xs text-slate-400">
                    Ingreso reportado: {ad.dateOfAdmission} por {ad.reportedBy}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider mb-2">
                    Cuerpo e Indicios Particulares
                  </span>
                  <p className="text-sm text-slate-700 italic leading-relaxed">"{ad.distinctiveFeatures}"</p>

                  {ad.identifyingPhotos && ad.identifyingPhotos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/55 space-y-1.5">
                      <span className="text-xs text-[#991b1b] font-bold block uppercase tracking-wider">
                        Galería de Evidencia (Tatuajes / Marcas)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {ad.identifyingPhotos.map((photo, pIdx) => (
                          <button
                            type="button"
                            key={pIdx}
                            onClick={() => setLightboxPhoto(photo)}
                            className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b] cursor-pointer transition hover:border-[#991b1b]/50"
                          >
                            <div className="aspect-square relative w-full overflow-hidden bg-slate-50">
                              <img
                                src={photo.url}
                                alt="Evidencia"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                                <span className="text-white text-xs font-bold uppercase tracking-wider bg-slate-900/85 px-2.5 py-1 rounded">
                                  Ampliar
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-4 items-center text-sm text-slate-500 pt-3 border-t border-slate-200/55">
                    <span>Conciencia: <strong className="text-slate-700">{ad.consciousnessLevel}</strong></span>
                    <span>Estatura: <strong className="text-slate-700">{ad.height} m</strong></span>
                    <span>Peso: <strong className="text-slate-700">{ad.weight} Kg</strong></span>
                    {ad.assignedTo && (
                      <span>
                        Designado a:{" "}
                        <strong className="text-[#991b1b] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md font-extrabold uppercase text-xs inline-block">
                          {ad.assignedTo}
                        </strong>
                      </span>
                    )}
                    {ad.notes && <span>Notas: <strong className="text-slate-700 italic">{ad.notes}</strong></span>}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    onClick={() => navigate(`/nn/${ad.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-[#991b1b] text-sm font-extrabold uppercase tracking-wider rounded-lg cursor-pointer transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Ver Expediente Completo
                  </button>
                  {ad.status === NNStatus.IDENTIFIED && (
                    <span className="text-sm text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Caso Homologado
                    </span>
                  )}
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
            <div className="bg-[#991b1b] text-white p-4 flex items-center justify-between border-b border-red-950">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-white" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-red-200">
                  Detalle de Evidencia Coincidente
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="text-white hover:text-red-100 p-1 rounded-lg border border-red-800 bg-red-900/50 hover:bg-red-900 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-square w-full bg-slate-50 flex items-center justify-center border-b border-slate-100">
              <img
                src={lightboxPhoto.url}
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
                className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer uppercase"
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
