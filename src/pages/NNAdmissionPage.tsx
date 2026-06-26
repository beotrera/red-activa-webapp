import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gender, ConsciousnessLevel } from "../types";
import { useCreateNNAdmission } from "../hooks/useApi";
import { toast } from "sonner";
import { Hospital, Camera, Image, X, ArrowLeft } from "lucide-react";
import PulseLoader from "../components/PulseLoader";

export default function NNAdmissionPage() {
  const navigate = useNavigate();
  const createNNMutation = useCreateNNAdmission();

  const [submitting, setSubmitting] = useState(false);
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [distinctiveFeatures, setDistinctiveFeatures] = useState("");
  const [consciousness, setConsciousness] = useState<ConsciousnessLevel>(ConsciousnessLevel.DISORIENTED);
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
      if (!isNaN(num) && num > 2.5) return;
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
    if (num < 0.3) { setHeight("0.30"); return; }
    if (num > 2.5) { setHeight("2.50"); return; }

    setHeight(num.toFixed(2));
  };

  const resetForm = () => {
    setAgeMin("");
    setAgeMax("");
    setGender(Gender.MALE);
    setHeight("");
    setWeight("");
    setDistinctiveFeatures("");
    setConsciousness(ConsciousnessLevel.DISORIENTED);
    setPhotos([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ageMin || !ageMax || !distinctiveFeatures) {
      toast.error("Por favor complete los campos obligatorios (*)");
      return;
    }

    if (Number(ageMin) > Number(ageMax)) {
      toast.error("La edad mínima no puede ser mayor a la máxima");
      return;
    }

    setSubmitting(true);

    let backendResult: "success" | "error" | null = null;

    createNNMutation.mutate(
      {
        estimatedAgeMin: Number(ageMin),
        estimatedAgeMax: Number(ageMax),
        gender,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        distinctiveFeatures,
        consciousnessLevel: consciousness,
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
        onClick={() => navigate("/nn")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al Listado de Casos
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
        <div className="flex items-center border-b border-slate-100 pb-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Hospital className="h-5 w-5 text-slate-500" />
            Carga rápida de ingreso NN
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Edad mín. *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej: 35"
                value={ageMin}
                onChange={handleIntChange(setAgeMin)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Edad máx. *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej: 45"
                value={ageMax}
                onChange={handleIntChange(setAgeMax)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Género *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value={Gender.MALE}>Masculino</option>
                <option value={Gender.FEMALE}>Femenino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Estatura aprox. (m)</label>
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
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Peso aprox. (kg)</label>
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
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nivel de conciencia *</label>
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
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Rasgos, señas o ropa *</label>
            <textarea
              rows={3}
              placeholder="Ej: Tatuaje de rosa azul en antebrazo izquierdo, viste buzo negro y zapatillas rojas..."
              value={distinctiveFeatures}
              onChange={(e) => setDistinctiveFeatures(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Camera className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">
                Fotos (tatuajes / marcas / cicatrices)
              </span>
              {photos.length > 0 && (
                <span className="ml-auto text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {photos.length} archivo{photos.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((file, idx) => (
                  <div key={idx} className="relative rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="h-28 w-full object-cover" />
                    <div className="px-2 py-1.5 text-xs text-slate-500 line-clamp-1 bg-slate-50">{file.name}</div>
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 p-1 bg-slate-700 hover:bg-slate-900 text-white rounded-md transition cursor-pointer"
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
                dragActive ? "border-slate-400 bg-slate-100" : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <label className="cursor-pointer block space-y-2">
                <Image className="mx-auto h-8 w-8 text-slate-400" />
                <div className="text-sm text-slate-700 font-medium">
                  Arrastre aquí o{" "}
                  <span className="text-slate-900 underline">seleccione archivos</span>
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#991b1b] hover:bg-red-900 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-2"
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
