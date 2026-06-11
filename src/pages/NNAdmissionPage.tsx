import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NNGender, ConsciousnessLevel } from "../types";
import { useCreateNNAdmission } from "../hooks/useApi";
import { toast } from "sonner";
import { Hospital, Camera, Image, X, ArrowLeft } from "lucide-react";
import PulseLoader from "../components/PulseLoader";

export default function NNAdmissionPage() {
  const navigate = useNavigate();
  const createNNMutation = useCreateNNAdmission();

  const [submitting, setSubmitting] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<NNGender>(NNGender.MALE);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [distinctiveFeatures, setDistinctiveFeatures] = useState("");
  const [consciousness, setConsciousness] = useState<ConsciousnessLevel>(ConsciousnessLevel.DISORIENTED);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleIntChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value.replace(/[^0-9]/g, ""));
  };

  const handleDecimalChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, "");
    // Allow only one decimal point
    const parts = val.split(".");
    if (parts.length > 2) val = `${parts[0]}.${parts.slice(1).join("")}`;
    setter(val);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, "");

    // Auto-insert decimal after first digit when 3+ digits without dot: "175" → "1.75"
    if (/^\d{3,}$/.test(val)) {
      val = `${val[0]}.${val.slice(1, 3)}`;
    }

    // Cap at 2 decimal places
    const dotIdx = val.indexOf(".");
    if (dotIdx !== -1 && val.length - dotIdx - 1 > 2) {
      val = val.slice(0, dotIdx + 3);
    }

    // Only enforce max once the value has a decimal (is in final format)
    if (val.includes(".")) {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 3.0) return;
    }

    setHeight(val);
  };

  const handleHeightBlur = () => {
    if (!height) return;
    let val = height;

    // "17" → "1.70", "2" → "2.00"
    if (/^\d+$/.test(val)) {
      val = `${val[0]}.${val.slice(1).padEnd(2, "0")}`;
    }

    const num = parseFloat(val);
    if (isNaN(num)) { setHeight(""); return; }
    if (num < 1.0) { setHeight("1.00"); return; }
    if (num > 3.0) { setHeight("3.00"); return; }

    setHeight(num.toFixed(2));
  };

  const resetForm = () => {
    setAge("");
    setGender(NNGender.MALE);
    setHeight("");
    setWeight("");
    setDistinctiveFeatures("");
    setConsciousness(ConsciousnessLevel.DISORIENTED);
    setNotes("");
    setPhotos([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!age || !distinctiveFeatures) {
      toast.error("Por favor complete los campos obligatorios (*)");
      return;
    }

    setSubmitting(true);

    let backendResult: "success" | "error" | null = null;

    createNNMutation.mutate(
      {
        estimatedAge: Number(age),
        gender,
        height: height || "0",
        weight: weight || "0",
        distinctiveFeatures,
        consciousnessLevel: consciousness,
        notes: notes || undefined,
        images: photos.length > 0 ? photos : undefined,
      },
      {
        onSuccess: () => { backendResult = "success"; },
        onError: () => { backendResult = "error"; },
      }
    );

    setTimeout(() => {
      setSubmitting(false);
      if (backendResult === "success") {
        toast.success("¡Registro de ingreso NN ingresado con éxito!");
        resetForm();
      } else if (backendResult === "error") {
        toast.error("No se pudo registrar el ingreso NN");
      } else {
        toast.error("El servidor tardó demasiado. Intente nuevamente.");
      }
    }, 15000);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from<File>(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) setPhotos((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setPhotos((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al Listado de Casos
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Hospital className="h-5 w-5 text-slate-800" />
            Carga Rápida de Ingreso NN
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-md">
            Vía Guardia
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Edad Est. *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej: 42"
                value={age}
                onChange={handleIntChange(setAge)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Género *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as NNGender)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value={NNGender.MALE}>Masculino</option>
                <option value={NNGender.FEMALE}>Femenino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Estatura aprox. (m)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ej: 1.75"
                value={height}
                onChange={handleHeightChange}
                onBlur={handleHeightBlur}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Peso aprox. (Kg)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ej: 80"
                value={weight}
                onChange={handleDecimalChange(setWeight)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Nivel de Conciencia *</label>
            <select
              value={consciousness}
              onChange={(e) => setConsciousness(e.target.value as ConsciousnessLevel)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value={ConsciousnessLevel.DISORIENTED}>Desorientado (Amnesia / Confuso)</option>
              <option value={ConsciousnessLevel.CONSCIOUS}>Consciente (Orientado)</option>
              <option value={ConsciousnessLevel.UNCONSCIOUS}>Inconsciente / Coma</option>
              <option value={ConsciousnessLevel.SEDATED}>Sedado farmacológicamente</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Rasgos, Señas o Ropa *</label>
            <textarea
              rows={3}
              placeholder="Ej: Tatuaje de rosa azul en antebrazo izquierdo, viste buzo negro y zapatillas rojas..."
              value={distinctiveFeatures}
              onChange={(e) => setDistinctiveFeatures(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
              required
            />
          </div>

          <div className="p-3 bg-red-50/20 border border-red-200/40 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 border-b border-red-200/30 pb-2">
              <Camera className="h-4 w-4 text-[#991b1b]" />
              <span className="text-xs font-bold text-[#991b1b] uppercase tracking-wider">
                Fotos (Tatuajes / Marcas / Cicatrices)
              </span>
              {photos.length > 0 && (
                <span className="ml-auto text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {photos.length} archivo{photos.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((file, idx) => (
                  <div key={idx} className="relative rounded-xl border border-[#991b1b]/20 overflow-hidden bg-white shadow-sm flex flex-col">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="h-28 w-full object-cover" />
                    <div className="px-2 py-1.5 text-xs text-slate-500 line-clamp-1 bg-slate-50">{file.name}</div>
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
                dragActive ? "border-[#991b1b] bg-red-50/40" : "border-slate-200 hover:border-[#991b1b]/30"
              }`}
            >
              <label className="cursor-pointer block space-y-2">
                <Image className="mx-auto h-8 w-8 text-slate-400" />
                <div className="text-sm text-slate-700 font-semibold">
                  Arrastre aquí o{" "}
                  <span className="text-[#991b1b] underline">seleccione archivos</span>
                </div>
                <p className="text-xs text-slate-400">JPG / PNG / WEBP — hasta 10 archivos, 5 MB c/u</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Notas Clínicas Adicionales</label>
            <textarea
              rows={2}
              placeholder="Notas médicas o psiquiátricas complementarias..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#991b1b] hover:bg-red-900 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 text-sm rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <PulseLoader className="h-5 w-5 text-white" />
            ) : (
              <>
                <Hospital className="h-5 w-5" />
                Registrar e Iniciar Cotejo
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
