import { useState } from "react";
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
  UserCheck,
} from "lucide-react";
import { NNAdmission, Gender, ConsciousnessLevel, NNStatus, UserRole, Institution } from "../types";
import { useUpdatePerson, useSimilarities } from "../hooks/useApi";
import { getImageUrl } from "../utils/api";
import { useAppSelector } from "../hooks/useAppDispatch";

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
    color: "text-slate-700 bg-white border-slate-300",
    dot: "bg-slate-400",
  },
  [NNStatus.POTENTIAL_MATCH]: {
    label: "COINCIDENCIA DETECTADA",
    color: "text-amber-800 bg-amber-50 border-amber-300",
    dot: "bg-amber-500",
  },
  [NNStatus.IDENTIFIED]: {
    label: "IDENTIFICADO",
    color: "text-emerald-800 bg-emerald-50 border-emerald-300",
    dot: "bg-emerald-500",
  },
};

function institutionName(institution: Institution | string | undefined): string | undefined {
  if (!institution) return undefined;
  return typeof institution === "string" ? undefined : institution.name;
}

interface NNDetailProps {
  admission: NNAdmission;
  onBack: () => void;
}

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
    <div className="space-y-5">

      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al listado
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            {canChangeStatus ? (
              <>
                <button
                  onClick={() => setStatusOpen((o) => !o)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition ${statusCfg.color}`}
                >
                  {statusCfg.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {statusOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                      <button
                        key={val}
                        onClick={() => handleStatusChange(val as NNStatus)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 cursor-pointer transition ${cfg.color} bg-transparent border-0`}
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
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            title="Copiar ID completo"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            Exp. #{shortId}
            <Copy className="h-3 w-3 text-slate-400" />
            {copied && <span className="text-emerald-600 font-sans font-semibold not-italic">Copiado</span>}
          </button>
        </div>
      </div>

      {/* ── Identity block ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-2 flex items-center gap-2">
          <Hospital className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Identificación del paciente</span>
        </div>
        <div className="px-5 py-4 space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900">
            Paciente NN · aprox. {admission.estimatedAgeMin}–{admission.estimatedAgeMax} años · {GENDER_LABEL[admission.gender]}
          </h2>
          <p className="text-sm text-slate-600 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {admission.address}{admission.neighborhood && ` — ${admission.neighborhood}`}
          </p>
          <p className="text-xs text-slate-400">
            Ingreso registrado el{" "}
            <span className="text-slate-600 font-medium">{new Date(admission.dateOfAdmission).toLocaleString("es-AR")}</span>
            {" "}por <span className="text-slate-600 font-medium">{admission.reportedBy}</span>
            {instName && <> · <span className="text-slate-600 font-medium">{instName}</span></>}
          </p>
        </div>
      </div>

      {/* ── Data grid ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-2 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Datos clínicos</span>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: "Edad estimada", value: `${admission.estimatedAgeMin}–${admission.estimatedAgeMax} años` },
              { label: "Género físico", value: GENDER_LABEL[admission.gender] },
              { label: "Estatura", value: admission.height != null ? `${admission.height} m` : "—" },
              { label: "Peso estimativo", value: admission.weight != null ? `${admission.weight} kg` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Nivel de conciencia</p>
            <p className="text-sm font-bold text-slate-900">{CONSCIOUSNESS_LABEL[admission.consciousnessLevel]}</p>
          </div>
          {admission.assignedTo && (
            <div className="px-4 py-3.5 flex items-center gap-3">
              <UserCheck className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Ente pericial asignado</p>
                <p className="text-sm font-bold text-slate-900 uppercase">{admission.assignedTo}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Features ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-2 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cuerpo e indicios particulares</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-slate-700 italic leading-relaxed">"{admission.distinctiveFeatures}"</p>
        </div>
      </div>

      {/* ── Photo gallery ── */}
      {admission.identifyingPhotos && admission.identifyingPhotos.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-2 flex items-center gap-2">
            <Camera className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Evidencias visuales de cotejo · {admission.identifyingPhotos.length} archivo{admission.identifyingPhotos.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {admission.identifyingPhotos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightbox(getImageUrl(photo.url) ?? photo.url)}
                className="group text-left border border-slate-200 rounded-lg overflow-hidden bg-slate-50 hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getImageUrl(photo.url)}
                    alt={photo.caption || "Evidencia"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {(photo.caption || photo.uploadedAt) && (
                  <div className="p-2 bg-white border-t border-slate-100 space-y-0.5">
                    {photo.caption && <p className="text-[10px] text-slate-600 line-clamp-2">{photo.caption}</p>}
                    {photo.uploadedAt && <p className="text-[10px] text-slate-400 font-mono">{new Date(photo.uploadedAt).toLocaleString()}</p>}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Similarities ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-2 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Coincidencias con denuncias ciudadanas</span>
        </div>
        <div className="p-5">
          {loadingSimilarities ? (
            <p className="text-xs text-slate-400 italic text-center py-4">Analizando coincidencias...</p>
          ) : similarities.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">
                No se detectaron coincidencias hasta el momento. El motor de cotejo corre en segundo plano y esta sección se actualiza automáticamente.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {similarities.map((sim) => (
                <div key={sim._id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-slate-900">{sim.report.fullName}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full ${sim.score >= 85 ? "bg-emerald-500" : "bg-amber-400"}`}
                          style={{ width: `${sim.score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold font-mono ${sim.score >= 85 ? "text-emerald-700" : "text-amber-700"}`}>
                        {sim.score}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-700">Barrio:</span> {sim.report.neighborhood}</p>
                    {sim.report.estimatedAge != null && <p><span className="font-semibold text-slate-700">Edad:</span> {sim.report.estimatedAge} años</p>}
                    {sim.report.gender && <p><span className="font-semibold text-slate-700">Género:</span> {GENDER_LABEL[sim.report.gender]}</p>}
                    {sim.report.lastSeenDate && <p><span className="font-semibold text-slate-700">Última vez visto:</span> {new Date(sim.report.lastSeenDate).toLocaleDateString()}</p>}
                  </div>
                  <p className="text-xs text-slate-600 italic bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                    "{sim.report.description}"
                  </p>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Justificación IA</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{sim.reasoning}</p>
                  </div>
                  {sim.differences.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1.5">Diferencias detectadas</p>
                      <ul className="list-disc pl-4 text-xs text-amber-700 space-y-0.5">
                        {sim.differences.map((diff, i) => <li key={i}>{diff}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Map ── */}
      <LocationMap address={admission.address} coordinates={admission.geoLocation?.coordinates} />

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-2xl w-full shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-semibold text-slate-600">Evidencia visual — detalle ampliado</span>
              <button
                onClick={() => setLightbox(null)}
                className="text-slate-500 hover:text-slate-900 text-xs font-semibold cursor-pointer transition"
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
