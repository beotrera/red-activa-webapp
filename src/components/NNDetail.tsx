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
} from "lucide-react";
import { NNAdmission, NNGender, ConsciousnessLevel, NNStatus } from "../types";
import { useUpdatePerson } from "../hooks/useApi";

// ─── Display maps ────────────────────────────────────────────────────────────

const GENDER_LABEL: Record<NNGender, string> = {
  [NNGender.MALE]: "Masculino",
  [NNGender.FEMALE]: "Femenino",
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

  const updateMutation = useUpdatePerson();

  const handleStatusChange = (status: NNStatus) => {
    setStatusOpen(false);
    setAdmission((prev) => ({ ...prev, status }));
    updateMutation.mutate({ id: admission.id, data: { status } });
  };

  const statusCfg = STATUS_CONFIG[admission.status];

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
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition ${statusCfg.color}`}
            >
              <span className="text-[9px] text-slate-500 font-semibold normal-case tracking-normal mr-0.5">
                ESTADO NN:
              </span>
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
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 cursor-pointer transition ${cfg.color} bg-transparent border-0`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    {cfg.label}
                    {val === admission.status && <CheckCircle2 className="h-3 w-3 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Case ID */}
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            Caso ID: #{admission.id}
          </span>

          {/* Match badge */}
          {admission.status === NNStatus.POTENTIAL_MATCH && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
              🔍 Cruce Directo Encontrado
            </span>
          )}
          {admission.status === NNStatus.IDENTIFIED && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" /> Caso Homologado
            </span>
          )}
        </div>
      </div>

      {/* ── Identity header ── */}
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Hospital className="h-5 w-5 text-slate-500 shrink-0" />
          Paciente NN de aprox. {admission.estimatedAge} años ({GENDER_LABEL[admission.gender]})
        </h2>
        <p className="text-sm font-semibold text-[#991b1b] flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {admission.location}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ingreso reportado el{" "}
          <strong className="text-slate-600">{admission.dateOfAdmission}</strong> por{" "}
          <span className="text-slate-600">{admission.reportedBy}</span>
          {admission.assignedTo && (
            <>
              . Asignado pericialmente a{" "}
              <strong className="text-slate-800">{admission.assignedTo}</strong>.
            </>
          )}
        </p>
      </div>

      {/* ── Data grid ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Edad Estimada</p>
            <p className="text-sm font-bold text-slate-900">{admission.estimatedAge} años</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Género Físico</p>
            <p className="text-sm font-bold text-slate-900">{GENDER_LABEL[admission.gender]}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Estatura</p>
            <p className="text-sm font-bold text-slate-900">{admission.height}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Peso Estimativo</p>
            <p className="text-sm font-bold text-slate-900">{admission.weight}</p>
          </div>

          <div className="col-span-2 sm:col-span-2 pt-4 border-t border-slate-100">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Nivel de Conciencia</p>
            <p className="text-sm font-bold text-slate-900">{CONSCIOUSNESS_LABEL[admission.consciousnessLevel]}</p>
          </div>
          {admission.assignedTo && (
            <div className="col-span-2 sm:col-span-2 pt-4 border-t border-slate-100">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Ente Pericial Asignado</p>
              <p className="text-sm font-extrabold text-[#991b1b] uppercase">{admission.assignedTo}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Features ── */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          Cuerpo e Indicios Particulares (Filiación)
        </h3>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-700 italic leading-relaxed">
            "{admission.distinctiveFeatures}"
          </p>
        </div>

        {admission.notes && (
          <div className="space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Notas Clínicas o de Guardia Complementarias
            </p>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-600 leading-relaxed">{admission.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Photo gallery ── */}
      {admission.identifyingPhotos && admission.identifyingPhotos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#991b1b] flex items-center gap-2 pb-2 border-b border-red-100">
            <Camera className="h-4 w-4" />
            Evidencias Visuales de Cotejo ({admission.identifyingPhotos.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {admission.identifyingPhotos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightbox(photo.url)}
                className="group text-left border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:border-[#991b1b]/50 hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#991b1b]"
              >
                <div className="aspect-square overflow-hidden bg-slate-50">
                  <img
                    src={photo.url}
                    alt="Evidencia"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {photo.uploadedAt && (
                  <div className="p-2 text-[9px] text-slate-400 font-mono">
                    {new Date(photo.uploadedAt).toLocaleString()}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Map ── */}
      <LocationMap location={admission.location} />

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
            <div className="bg-[#991b1b] px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-200">
                Evidencia Visual — Detalle Ampliado
              </span>
              <button
                onClick={() => setLightbox(null)}
                className="text-white hover:text-red-200 text-xs font-bold cursor-pointer"
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
