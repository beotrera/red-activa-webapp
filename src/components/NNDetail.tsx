import React, { useState } from "react";
import LocationMap from "./LocationMap";
import {
  ArrowLeft,
  MapPin,
  Hospital,
  Camera,
  FileText,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { NNAdmission, Gender, ConsciousnessLevel, NNStatus, UserRole, Institution } from "../types";
import { useUpdatePerson, useSimilarities } from "../hooks/useApi";
import { getImageUrl } from "../utils/api";
import { useAppSelector } from "../hooks/useAppDispatch";

// ─── Display maps ────────────────────────────────────────────────────────────

const GENDER_LABEL: Record<Gender, string> = {
  [Gender.MALE]: "Masculino",
  [Gender.FEMALE]: "Femenino",
};

const CONSCIOUSNESS_LABEL: Record<ConsciousnessLevel, string> = {
  [ConsciousnessLevel.CONSCIOUS]: "Consciente",
  [ConsciousnessLevel.DISORIENTED]: "Desorientado",
  [ConsciousnessLevel.UNCONSCIOUS]: "Inconsciente",
  [ConsciousnessLevel.SEDATED]: "Sedado",
};

const STATUS_CONFIG: Record<NNStatus, { label: string; color: string; dot: string }> = {
  [NNStatus.UNIDENTIFIED]: {
    label: "SIN IDENTIFICAR",
    color: "text-slate-600 bg-slate-100 border-slate-200",
    dot: "bg-slate-400",
  },
  [NNStatus.POTENTIAL_MATCH]: {
    label: "PENDIENTE",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
  },
  [NNStatus.IDENTIFIED]: {
    label: "IDENTIFICADO",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

function institutionName(institution: Institution | string | undefined): string | undefined {
  if (!institution) return undefined;
  return typeof institution === "string" ? undefined : institution.name;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NNDetailProps {
  admission: NNAdmission;
  onBack: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NNDetail({ admission: initial, onBack }: NNDetailProps) {
  const [admission, setAdmission] = useState(initial);
  const [statusOpen, setStatusOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentUser = useAppSelector((state) => state.auth.user);
  const canChangeStatus = currentUser?.role === UserRole.ADMINISTRATOR;

  const updateMutation = useUpdatePerson();
  const { data: similarities = [], isLoading: loadingSimilarities } = useSimilarities(admission.id);

  const handleStatusChange = (status: NNStatus) => {
    setStatusOpen(false);
    setAdmission((prev) => ({ ...prev, status }));
    updateMutation.mutate({ id: admission.id, data: { status } });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(admission.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const statusCfg = STATUS_CONFIG[admission.status];
  const instName = institutionName(admission.institution);
  const shortId = admission.id.slice(-8);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al Listado de Casos
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status dropdown (Administrator only) */}
          <div className="relative">
            {canChangeStatus ? (
              <>
                <button
                  onClick={() => setStatusOpen((o) => !o)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition ${statusCfg.color}`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                  <ChevronDown className="h-3 w-3 ml-0.5" />
                </button>

                {statusOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                      <button
                        key={val}
                        onClick={() => handleStatusChange(val as NNStatus)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition ${cfg.color} bg-transparent border-0`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                        {cfg.label}
                        {val === admission.status && <CheckCircle2 className="h-3 w-3 ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold ${statusCfg.color}`}>
                <span className={`inline-block w-2 h-2 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            )}
          </div>

          {/* Case ID — short, copyable */}
          <button
            type="button"
            onClick={handleCopyId}
            title="Copiar ID completo"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            #{shortId}
            <Copy className="h-3 w-3 text-slate-400" />
            {copied && <span className="text-emerald-600 font-sans font-semibold">Copiado</span>}
          </button>
        </div>
      </div>

      {/* ── Identity header ── */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Hospital className="h-5 w-5 text-slate-500 shrink-0" />
          Paciente NN de aprox. {admission.estimatedAgeMin}–{admission.estimatedAgeMax} años ({GENDER_LABEL[admission.gender]})
        </h2>
        <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {admission.address} {admission.neighborhood && `— ${admission.neighborhood}`}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ingreso reportado el{" "}
          <strong className="text-slate-600">{new Date(admission.dateOfAdmission).toLocaleString()}</strong> por{" "}
          <span className="text-slate-600">{admission.reportedBy}</span>
          {instName && (
            <>
              {" "}en <strong className="text-slate-800">{instName}</strong>
            </>
          )}
          {admission.assignedTo && (
            <>
              . Asignado pericialmente a{" "}
              <strong className="text-slate-800">{admission.assignedTo}</strong>.
            </>
          )}
        </p>
      </div>

      {/* ── Data grid ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Edad estimada</p>
            <p className="text-sm font-semibold text-slate-900">{admission.estimatedAgeMin}–{admission.estimatedAgeMax} años</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Género físico</p>
            <p className="text-sm font-semibold text-slate-900">{GENDER_LABEL[admission.gender]}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Estatura</p>
            <p className="text-sm font-semibold text-slate-900">{admission.height != null ? `${admission.height} m` : "No especificada"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Peso estimativo</p>
            <p className="text-sm font-semibold text-slate-900">{admission.weight != null ? `${admission.weight} kg` : "No especificado"}</p>
          </div>
          <div className="col-span-2 sm:col-span-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Nivel de conciencia</p>
            <p className="text-sm font-semibold text-slate-900">{CONSCIOUSNESS_LABEL[admission.consciousnessLevel]}</p>
          </div>
        </div>

        {admission.assignedTo && (
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">Ente pericial asignado:</span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wide">
              {admission.assignedTo}
            </span>
          </div>
        )}
      </div>

      {/* ── Features ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          Cuerpo e indicios particulares
        </h3>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-700 italic leading-relaxed">
            "{admission.distinctiveFeatures}"
          </p>
        </div>
      </div>

      {/* ── Photo gallery ── */}
      {admission.identifyingPhotos && admission.identifyingPhotos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
            <Camera className="h-4 w-4 text-slate-400" />
            Evidencias visuales de cotejo ({admission.identifyingPhotos.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {admission.identifyingPhotos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightbox(getImageUrl(photo.url) ?? photo.url)}
                className="group text-left border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:border-slate-400 hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <div className="aspect-square overflow-hidden bg-slate-50">
                  <img
                    src={getImageUrl(photo.url)}
                    alt={photo.caption || "Evidencia"}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {(photo.caption || photo.uploadedAt) && (
                  <div className="p-2 space-y-0.5">
                    {photo.caption && (
                      <p className="text-xs text-slate-600 leading-snug line-clamp-2">{photo.caption}</p>
                    )}
                    {photo.uploadedAt && (
                      <p className="text-xs text-slate-400 font-mono">
                        {new Date(photo.uploadedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Similarities (AI matching against citizen reports) ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Posibles coincidencias con denuncias ciudadanas
        </h3>

        {loadingSimilarities ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400 italic">
            Buscando coincidencias...
          </div>
        ) : similarities.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400 italic flex flex-col items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-slate-300" />
            Aún no se detectaron coincidencias. El motor de cotejo corre en segundo plano — esta sección se actualiza automáticamente.
          </div>
        ) : (
          <div className="space-y-3">
            {similarities.map((sim) => (
              <div key={sim._id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900">{sim.report.fullName}</h4>
                  <span
                    className={`text-xs font-semibold font-mono px-2 py-0.5 rounded-full ${
                      sim.score >= 85 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {sim.score}% coincidencia
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <p><span className="font-semibold text-slate-800">Barrio:</span> {sim.report.neighborhood}</p>
                  {sim.report.estimatedAge != null && (
                    <p><span className="font-semibold text-slate-800">Edad:</span> {sim.report.estimatedAge} años</p>
                  )}
                  {sim.report.gender && (
                    <p><span className="font-semibold text-slate-800">Género:</span> {GENDER_LABEL[sim.report.gender]}</p>
                  )}
                  {sim.report.lastSeenDate && (
                    <p><span className="font-semibold text-slate-800">Visto por última vez:</span> {new Date(sim.report.lastSeenDate).toLocaleDateString()}</p>
                  )}
                </div>

                <p className="text-xs text-slate-600 italic bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  "{sim.report.description}"
                </p>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Justificación de la IA</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{sim.reasoning}</p>
                </div>

                {sim.differences.length > 0 && (
                  <div>
                    <p className="text-xs text-amber-600 font-semibold mb-1">Diferencias detectadas</p>
                    <ul className="list-disc pl-4 text-xs text-amber-700 space-y-0.5">
                      {sim.differences.map((diff, i) => (
                        <li key={i}>{diff}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Map ── */}
      <LocationMap
        address={admission.address}
        coordinates={admission.geoLocation?.coordinates}
      />

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Evidencia visual — detalle ampliado
              </span>
              <button
                onClick={() => setLightbox(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition"
              >
                ✕ Cerrar
              </button>
            </div>
            <img
              src={lightbox}
              alt="Evidencia ampliada"
              className="w-full object-contain max-h-[70vh]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

    </div>
  );
}
