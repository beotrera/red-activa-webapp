import { useState } from "react";
import LocationMap from "./LocationMap";
import {
  ArrowLeft,
  MapPin,
  Camera,
  FileText,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Copy,
  UserCheck,
  User,
  Scale,
  Ruler,
  Brain,
  Building2,
  Calendar,
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

const CONSCIOUSNESS_COLOR: Record<ConsciousnessLevel, string> = {
  [ConsciousnessLevel.CONSCIOUS]: "text-emerald-600",
  [ConsciousnessLevel.DISORIENTED]: "text-amber-600",
  [ConsciousnessLevel.UNCONSCIOUS]: "text-red-700",
  [ConsciousnessLevel.SEDATED]: "text-slate-500",
};

const STATUS_CONFIG: Record<NNStatus, {
  label: string;
  badge: string;
  dot: string;
  accent: string;
  heroBg: string;
  heroText: string;
}> = {
  [NNStatus.UNIDENTIFIED]: {
    label: "Sin identificar",
    badge: "text-white bg-white/15 border-white/30",
    dot: "bg-slate-300",
    accent: "border-t-slate-500",
    heroBg: "from-slate-900 to-slate-800",
    heroText: "text-slate-300",
  },
  [NNStatus.POTENTIAL_MATCH]: {
    label: "Coincidencia detectada",
    badge: "text-amber-200 bg-amber-500/20 border-amber-400",
    dot: "bg-amber-400",
    accent: "border-t-amber-500",
    heroBg: "from-slate-900 to-amber-950",
    heroText: "text-amber-300",
  },
  [NNStatus.IDENTIFIED]: {
    label: "Identificado",
    badge: "text-emerald-200 bg-emerald-500/20 border-emerald-400",
    dot: "bg-emerald-400",
    accent: "border-t-emerald-500",
    heroBg: "from-slate-900 to-emerald-950",
    heroText: "text-emerald-300",
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

  const cfg = STATUS_CONFIG[admission.status];
  const instName = institutionName(admission.institution);
  const shortId = admission.id.slice(-8);
  const firstPhoto = admission.identifyingPhotos?.[0];
  const extraPhotos = admission.identifyingPhotos?.slice(1) ?? [];

  return (
    <div className="space-y-4">

      {/* ── Hero ── */}
      <div className={`bg-linear-to-br ${cfg.heroBg} rounded-2xl border-t-4 ${cfg.accent} overflow-hidden shadow-lg`}>

        {/* Top bar inside hero */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al listado
          </button>

          <div className="flex items-center gap-2">
            {/* Status badge / dropdown */}
            <div className="relative">
              {canChangeStatus ? (
                <>
                  <button
                    onClick={() => setStatusOpen((o) => !o)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition ${cfg.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {statusOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      {Object.entries(STATUS_CONFIG).map(([val, c]) => (
                        <button
                          key={val}
                          onClick={() => handleStatusChange(val as NNStatus)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 cursor-pointer transition text-slate-700"
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                          {c.label}
                          {val === admission.status && <CheckCircle2 className="h-3 w-3 ml-auto text-slate-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              )}
            </div>

            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/50 hover:text-white/80 bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              Exp. #{shortId}
              <Copy className="h-3 w-3" />
              {copied && <span className="font-sans text-emerald-400 not-italic font-semibold">Copiado</span>}
            </button>
          </div>
        </div>

        {/* Hero content */}
        <div className="px-6 pt-5 pb-6 flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Photo avatar */}
          <div className="shrink-0">
            {firstPhoto ? (
              <button
                onClick={() => setLightbox(getImageUrl(firstPhoto.url) ?? firstPhoto.url)}
                className="block w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl cursor-pointer hover:border-white/50 transition"
              >
                <img
                  src={getImageUrl(firstPhoto.url)}
                  alt="Foto de identificación"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <User className="h-10 w-10 text-white/20" />
              </div>
            )}
          </div>

          {/* Patient title */}
          <div className="flex-1 min-w-0">
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${cfg.heroText}`}>
              Persona no identificada
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {admission.estimatedAgeMin}–{admission.estimatedAgeMax} años · {GENDER_LABEL[admission.gender]}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-sm text-white/60">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {admission.address}{admission.neighborhood ? ` · ${admission.neighborhood}` : ""}
              </span>
              {instName && (
                <span className="flex items-center gap-1.5 text-sm text-white/60">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  {instName}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-white/60">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {new Date(admission.dateOfAdmission).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── LEFT: clinical + features + similarities ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Clinical stats */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Datos clínicos</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-100">
              <div className="px-4 py-4 flex flex-col gap-1">
                <User className="h-4 w-4 text-slate-300 mb-1" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Edad estimada</p>
                <p className="text-xl font-black text-slate-900">{admission.estimatedAgeMin}–{admission.estimatedAgeMax}</p>
                <p className="text-[10px] text-slate-400">años</p>
              </div>
              <div className="px-4 py-4 flex flex-col gap-1">
                <User className="h-4 w-4 text-slate-300 mb-1" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Género físico</p>
                <p className="text-xl font-black text-slate-900">{GENDER_LABEL[admission.gender]}</p>
              </div>
              <div className="px-4 py-4 flex flex-col gap-1">
                <Ruler className="h-4 w-4 text-slate-300 mb-1" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Estatura</p>
                <p className="text-xl font-black text-slate-900">{admission.height != null ? admission.height : "—"}</p>
                {admission.height != null && <p className="text-[10px] text-slate-400">metros</p>}
              </div>
              <div className="px-4 py-4 flex flex-col gap-1">
                <Scale className="h-4 w-4 text-slate-300 mb-1" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Peso estimativo</p>
                <p className="text-xl font-black text-slate-900">{admission.weight != null ? admission.weight : "—"}</p>
                {admission.weight != null && <p className="text-[10px] text-slate-400">kilogramos</p>}
              </div>
            </div>
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              <div className="px-5 py-3.5 flex items-center gap-3">
                <Brain className="h-4 w-4 text-slate-300 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Nivel de conciencia</p>
                  <p className={`text-sm font-bold ${CONSCIOUSNESS_COLOR[admission.consciousnessLevel]}`}>
                    {CONSCIOUSNESS_LABEL[admission.consciousnessLevel]}
                  </p>
                </div>
              </div>
              {admission.assignedTo && (
                <div className="px-5 py-3.5 flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-slate-300 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Ente pericial asignado</p>
                    <p className="text-sm font-bold text-slate-900 uppercase">{admission.assignedTo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Distinctive features */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cuerpo e indicios particulares</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-slate-700 italic leading-relaxed">"{admission.distinctiveFeatures}"</p>
            </div>
          </div>

          {/* Similarities */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Coincidencias con denuncias ciudadanas</span>
              </div>
              {similarities.length > 0 && (
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {similarities.length}
                </span>
              )}
            </div>
            <div className="p-5">
              {loadingSimilarities ? (
                <p className="text-xs text-slate-400 italic text-center py-4">Analizando coincidencias...</p>
              ) : similarities.length === 0 ? (
                <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500">
                    No se detectaron coincidencias hasta el momento. El motor de cotejo corre en segundo plano y esta sección se actualiza automáticamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {similarities.map((sim) => {
                    const high = sim.score >= 85;
                    return (
                      <div key={sim._id} className={`border rounded-xl overflow-hidden ${high ? "border-emerald-200" : "border-amber-200"}`}>
                        {/* Score header */}
                        <div className={`px-4 py-3 flex items-center justify-between gap-3 ${high ? "bg-emerald-50" : "bg-amber-50"}`}>
                          <h4 className="text-sm font-bold text-slate-900">{sim.report.fullName}</h4>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-20 h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full ${high ? "bg-emerald-500" : "bg-amber-400"}`}
                                style={{ width: `${sim.score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-black font-mono ${high ? "text-emerald-700" : "text-amber-700"}`}>
                              {sim.score}%
                            </span>
                          </div>
                        </div>
                        {/* Details */}
                        <div className="px-4 py-3 space-y-3 bg-white">
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                            <p><span className="font-semibold text-slate-700">Barrio:</span> {sim.report.neighborhood}</p>
                            {sim.report.estimatedAge != null && <p><span className="font-semibold text-slate-700">Edad:</span> {sim.report.estimatedAge} años</p>}
                            {sim.report.gender && <p><span className="font-semibold text-slate-700">Género:</span> {GENDER_LABEL[sim.report.gender]}</p>}
                            {sim.report.lastSeenDate && <p><span className="font-semibold text-slate-700">Última vez:</span> {new Date(sim.report.lastSeenDate).toLocaleDateString("es-AR")}</p>}
                          </div>
                          <p className="text-xs text-slate-600 italic bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                            "{sim.report.description}"
                          </p>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Justificación IA</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{sim.reasoning}</p>
                          </div>
                          {sim.differences.length > 0 && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">Diferencias detectadas</p>
                              <ul className="list-disc pl-4 text-xs text-amber-700 space-y-0.5">
                                {sim.differences.map((diff, i) => <li key={i}>{diff}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── RIGHT: extra photos + map ── */}
        <div className="space-y-4">

          {/* Extra photos */}
          {extraPhotos.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Camera className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Más evidencias · {extraPhotos.length + (firstPhoto ? 1 : 0)} archivos
                </span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {extraPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightbox(getImageUrl(photo.url) ?? photo.url)}
                    className="group aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-slate-400 transition cursor-pointer focus:outline-none"
                  >
                    <img
                      src={getImageUrl(photo.url)}
                      alt={photo.caption || "Evidencia"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exact location map */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ubicación del centro</span>
            </div>
            <LocationMap address={admission.address} coordinates={admission.geoLocation?.coordinates} />
          </div>

          {/* Reported by card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Registrado por</p>
            <p className="text-sm font-bold text-slate-900">{admission.reportedBy}</p>
            {instName && <p className="text-xs text-slate-500 mt-0.5">{instName}</p>}
            <p className="text-xs text-slate-400 mt-1">
              {new Date(admission.dateOfAdmission).toLocaleString("es-AR")}
            </p>
          </div>

        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl border border-slate-200"
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
