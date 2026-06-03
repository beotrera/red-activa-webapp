import React, { useState } from "react";
import { Hospital, User, AlertCircle, PlusCircle, Search, ShieldAlert, Heart, ClipboardList } from "lucide-react";
import { NNAdmission } from "../types";

interface HospitalAdmissionProps {
  nnAdmissions: NNAdmission[];
  onSubmitAdmission: (data: Partial<NNAdmission>) => void;
}

export default function HospitalAdmission({ nnAdmissions, onSubmitAdmission }: HospitalAdmissionProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form fields
  const [estimatedAge, setEstimatedAge] = useState("");
  const [gender, setGender] = useState("Masculino");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [distinctiveFeatures, setDistinctiveFeatures] = useState("");
  const [consciousnessLevel, setConsciousnessLevel] = useState("Desorientado");
  const [location, setLocation] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [notes, setNotes] = useState("");

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setFormError("");

    if (!estimatedAge || !distinctiveFeatures || !location || !reportedBy) {
      setFormError("Por favor, complete todos los campos obligatorios (*)");
      return;
    }

    const newAd: Partial<NNAdmission> = {
      estimatedAge: Number(estimatedAge),
      gender: gender as any,
      height: height || "No especificada",
      weight: weight || "No especificado",
      distinctiveFeatures,
      consciousnessLevel: consciousnessLevel as any,
      location,
      reportedBy,
      notes
    };

    onSubmitAdmission(newAd);
    setSuccessMsg("Registro ingresado exitosamente al sistema. Computando posibles coincidencias AI...");
    
    // Reset Form
    setEstimatedAge("");
    setGender("Masculino");
    setHeight("");
    setWeight("");
    setDistinctiveFeatures("");
    setConsciousnessLevel("Desorientado");
    setLocation("");
    setReportedBy("");
    setNotes("");

    // Hide with timer
    setTimeout(() => {
      setShowForm(false);
      setSuccessMsg("");
    }, 2500);
  };

  const filteredAdmissions = nnAdmissions.filter(ad => {
    const searchString = `${ad.location} ${ad.distinctiveFeatures} ${ad.estimatedAge} ${ad.gender}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* List of active unidentified cases */}
      <div className="lg:col-span-2 space-y-4 order-last lg:order-first">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-slate-800" />
                Registros Clínicos de Pacientes NN
              </h2>
              <p className="text-xs text-slate-500">Listado de personas ingresadas sin identificación o desorientadas en guardia</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por lugar, rasgos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-slate-250 rounded-lg text-xs w-full sm:w-64 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAdmissions.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs italic">
                No se encontraron admisiones registradas.
              </div>
            ) : (
              filteredAdmissions.map((ad) => (
                <div 
                  key={ad.id} 
                  className={`border rounded-2xl p-4 transition-all duration-200 relative ${
                    ad.status === "Identified" 
                      ? "bg-slate-50/50 border-emerald-300 text-slate-450" 
                      : ad.status === "Potential Match" 
                      ? "bg-white border-slate-300 shadow-sm ring-1 ring-slate-900"
                      : "bg-white border-slate-200 hover:border-slate-350"
                  }`}
                >
                  {/* Identification tag */}
                  <span className={`absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                    ad.status === "Identified"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : ad.status === "Potential Match"
                      ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {ad.status === "Identified" 
                      ? "✓ IDENTIFICADO" 
                      : ad.status === "Potential Match" 
                      ? "🔍 CON ALERTA AI" 
                      : "SIN IDENTIFICAR"}
                  </span>

                  <div className="flex gap-2.5 items-start">
                    <div className="bg-slate-100 text-slate-700 p-2 rounded-lg mt-0.5 border border-slate-200">
                      <Hospital className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-950">
                        NN de aprox. {ad.estimatedAge} años ({ad.gender})
                      </h4>
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Hospital className="h-3.5 w-3.5 inline text-slate-450" /> {ad.location}
                      </p>
                      <p className="text-[10px] text-slate-400">Ingreso: {ad.dateOfAdmission}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 mt-3 border border-slate-150">
                    <span className="text-[9px] text-slate-450 font-bold block uppercase mb-0.5">Descripción de Ingreso</span>
                    <p className="italic">"{ad.distinctiveFeatures}"</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 mt-3 border-t border-slate-100">
                    <span>Nivel Conciencia: <strong className="text-slate-950">{ad.consciousnessLevel}</strong></span>
                    <span>Reportante: {ad.reportedBy}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Register form */}
      <div className="space-y-4">
        {/* Call to action card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-950">
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-slate-350" />
            REGISTRO INMEDIATO NN
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Habilite la comparación automática instantánea cargando los datos de personas desorientadas, inconscientes, o pacientes de urgencias ingresados sin acreditación filiatoria.
          </p>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="mt-4 w-full bg-slate-800 text-white hover:bg-slate-750 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            {showForm ? "Ocultar Planilla de Ingreso" : "Registrar Nuevo Ingreso"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-slide-up">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wide">
              Planilla de Ingreso Clínico / Médico
            </h3>

            {formError && (
              <div className="bg-red-50 text-red-800 p-2.5 rounded-lg text-xs flex gap-2 items-center border border-red-100">
                <AlertCircle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg text-xs flex gap-2 items-center border border-green-100">
                <AlertCircle className="h-4 w-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Edad Aproximada *</label>
                <input 
                  type="number" 
                  value={estimatedAge}
                  onChange={(e) => setEstimatedAge(e.target.value)}
                  placeholder="Ej: 45"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-600 mb-1">Género Observado *</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="Desconocido">Desconocido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Estatura aprox.</label>
                <input 
                  type="text" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ej: 1.75m"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-600 mb-1">Peso aprox.</label>
                <input 
                  type="text" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej: 80kg"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-600 mb-1">Nivel de Conciencia *</label>
              <select 
                value={consciousnessLevel}
                onChange={(e) => setConsciousnessLevel(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Consciente">Consciente (Orientado/Tímido)</option>
                <option value="Desorientado">Desorientado (Confuso/Amnesia)</option>
                <option value="Inconsciente">Inconsciente / Coma</option>
                <option value="Sedado">Sedado farmacológicamente</option>
              </select>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-600 mb-1">Institución / Centro de Ingreso *</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Hospital de Clínicas Guardia General"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-605 mb-1">Rasgos Físicos, Vestimenta o Marcas corporales *</label>
              <textarea 
                rows={3}
                value={distinctiveFeatures}
                onChange={(e) => setDistinctiveFeatures(e.target.value)}
                placeholder="Ej: Tatuaje de escudo heráldico en brazo derecho, viste bermudas azules marca Nike, cicatriz en mentón."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-605 mb-1">Profesional u Oficial Emisor *</label>
              <input 
                type="text" 
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="Ej: Dra. Alicia Martínez o Guardia Cabo Rossi"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-605 mb-1">Notas complementarias</label>
              <textarea 
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Encontrado descalzo cruce Av Triunvirato..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Hospital className="h-4 w-4" />
              Ingresar NN y Cotejar AI
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
