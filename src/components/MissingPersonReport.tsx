import React, { useState } from "react";
import { User, Search, PlusCircle, AlertCircle, ShieldAlert, Heart, Calendar, Phone, MapPin, Check, Send } from "lucide-react";
import { MissingPerson } from "../types";

interface MissingPersonReportProps {
  missingPersons: MissingPerson[];
  onSubmitReport: (data: Partial<MissingPerson>) => void;
}

export default function MissingPersonReport({ missingPersons, onSubmitReport }: MissingPersonReportProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clueTargetId, setClueTargetId] = useState<string | null>(null);
  const [clueText, setClueText] = useState("");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Masculino");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [distinctiveFeatures, setDistinctiveFeatures] = useState("");
  const [dateOfDisappearance, setDateOfDisappearance] = useState("");
  const [placeOfDisappearance, setPlaceOfDisappearance] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [clueSuccessMsg, setClueSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setFormError("");

    if (!fullName || !age || !gender || !distinctiveFeatures || !dateOfDisappearance || !placeOfDisappearance) {
      setFormError("Por favor, complete todos los campos obligatorios (*)");
      return;
    }

    const newReport: Partial<MissingPerson> = {
      fullName,
      age: Number(age),
      gender: gender as any,
      height: height || "No especificada",
      weight: weight || "No especificado",
      distinctiveFeatures,
      dateOfDisappearance,
      placeOfDisappearance,
      contactName: contactName || "Anónimo",
      contactPhone: contactPhone || "No especificada",
      notes,
      photoUrl: photoUrl || undefined
    };

    onSubmitReport(newReport);
    setSuccessMsg("Reporte de búsqueda publicado exitosamente. Inicializando rastreo de coincidencias biométricas...");

    // Reset Form
    setFullName("");
    setAge("");
    setGender("Masculino");
    setHeight("");
    setWeight("");
    setDistinctiveFeatures("");
    setDateOfDisappearance("");
    setPlaceOfDisappearance("");
    setContactName("");
    setContactPhone("");
    setNotes("");
    setPhotoUrl("");

    setTimeout(() => {
      setShowForm(false);
      setSuccessMsg("");
    }, 2500);
  };

  const handleClueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueText.trim()) return;

    setClueSuccessMsg("Aporte recibido. Se ha enviado una patrulla y un aviso judicial al sector indicado.");
    setClueText("");

    setTimeout(() => {
      setClueTargetId(null);
      setClueSuccessMsg("");
    }, 3000);
  };

  const [búsquedaStatus, setBúsquedaStatus] = useState<"active" | "resolved" | "all">("active");

  const filteredPersons = missingPersons.filter(person => {
    if (búsquedaStatus === "active" && person.status === "Resolved") return false;
    if (búsquedaStatus === "resolved" && person.status !== "Resolved") return false;

    const searchString = `${person.fullName} ${person.placeOfDisappearance} ${person.distinctiveFeatures}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Searchable Public Catalog */}
      <div className="lg:col-span-2 space-y-4 order-last lg:order-first">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-[#991b1b]" />
                {búsquedaStatus === "resolved" ? "Catálogo Público de Identidades Resueltas" : "Catálogo Público de Búsquedas Activas"}
              </h2>
              <p className="text-xs text-slate-500">
                {búsquedaStatus === "resolved" ? "Registro histórico de reencuentros homologados" : "Colaboración ciudadana para el reencuentro de personas"}
              </p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, lugar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-slate-250 rounded-lg text-xs w-full sm:w-64 focus:ring-1 focus:ring-[#991b1b] focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          {/* Sub-Tabs for filter categorization (Abierto vs Cerrado separation of concern) */}
          <div className="flex border-b border-slate-200 mb-6 space-x-6 text-[11px] font-semibold">
            <button 
              type="button"
              onClick={() => setBúsquedaStatus("active")}
              className={`pb-2.5 px-1 transition-all border-b-2 cursor-pointer uppercase tracking-wider ${
                búsquedaStatus === "active" 
                  ? "border-[#991b1b] text-[#991b1b] font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-800"
              }`}
            >
              📢 Búsquedas Activas ({missingPersons.filter(p => p.status !== "Resolved").length})
            </button>
            <button 
              type="button"
              onClick={() => setBúsquedaStatus("resolved")}
              className={`pb-2.5 px-1 transition-all border-b-2 cursor-pointer uppercase tracking-wider ${
                búsquedaStatus === "resolved" 
                  ? "border-[#991b1b] text-[#991b1b] font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-800"
              }`}
            >
              ✓ Casos Resueltos / Cerrados ({missingPersons.filter(p => p.status === "Resolved").length})
            </button>
            <button 
              type="button"
              onClick={() => setBúsquedaStatus("all")}
              className={`pb-2.5 px-1 transition-all border-b-2 cursor-pointer uppercase tracking-wider ${
                búsquedaStatus === "all" 
                  ? "border-[#991b1b] text-[#991b1b] font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-800"
              }`}
            >
              Ver Todas ({missingPersons.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPersons.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs italic">
                No se encontraron personas correspondientes a los filtros indicados.
              </div>
            ) : (
              filteredPersons.map((person) => (
                <div 
                  key={person.id} 
                  className={`border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between ${
                    person.status === "Resolved" 
                      ? "bg-slate-50/50 border-emerald-300 text-slate-450" 
                      : "bg-white border-slate-200 hover:border-slate-350 hover:shadow-sm"
                  }`}
                >
                  <div>
                    {/* Status Pill */}
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                        person.status === "Resolved" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-red-50 text-[#991b1b] border-red-200 animate-pulse font-extrabold"
                      }`}>
                        {person.status === "Resolved" ? "✓ Caso Resuelto" : "Búsqueda Civil Activa"}
                      </span>
                      <span className="text-[10px] text-slate-400">ID: {person.id}</span>
                    </div>

                    <div className="flex gap-3 mt-3">
                      <img 
                        src={person.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"} 
                        alt={person.fullName} 
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-950">{person.fullName}</h4>
                        <p className="text-xs text-slate-500">Edad: {person.age} años | {person.gender}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="h-3.5 w-3.5 text-slate-550" />
                        <span>Visto en: <strong>{person.placeOfDisappearance}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Fecha de desaparición: {person.dateOfDisappearance}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-705 mt-3 border border-slate-150">
                      <span className="text-[9px] text-slate-450 font-bold block uppercase mb-1">Señas Particularidades</span>
                      <p className="italic text-slate-650">"{person.distinctiveFeatures}"</p>
                    </div>
                  </div>

                  {/* Citizen Input Clue Trigger */}
                  {person.status !== "Resolved" && (
                    <div className="pt-3 mt-3 border-t border-slate-100">
                      {clueTargetId === person.id ? (
                        <form onSubmit={handleClueSubmit} className="space-y-2">
                          <label className="block text-[9px] font-bold text-slate-900 uppercase tracking-widest">
                            Aportar Pista Anónima o Ubicación
                          </label>
                          
                          {clueSuccessMsg ? (
                            <p className="text-[10px] bg-emerald-50 text-emerald-800 p-1.5 rounded-md font-semibold">
                              {clueSuccessMsg}
                            </p>
                          ) : (
                            <div className="flex gap-1">
                              <input 
                                type="text" 
                                placeholder="Vi a alguien parecido en estación Retiro..."
                                value={clueText}
                                onChange={(e) => setClueText(e.target.value)}
                                className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] w-full focus:outline-none focus:ring-1 focus:ring-[#991b1b]"
                                required
                              />
                              <button 
                                type="submit" 
                                className="bg-[#991b1b] text-white p-1.5 rounded hover:bg-[#7f1d1d] cursor-pointer flex items-center justify-center"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </form>
                      ) : (
                        <button 
                          onClick={() => setClueTargetId(person.id)}
                          className="w-full bg-red-50 text-[#991b1b] hover:bg-red-100 transition-all text-xs font-bold py-1 px-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer border border-red-200"
                        >
                          <Send className="h-3 w-3" />
                          Aportar Pista o Avistamiento
                        </button>
                      )}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Side Bar form */}
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[#7f1d1d] to-[#991b1b] text-white rounded-2xl p-6 border border-red-950 shadow-md">
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-red-200" />
            REGISTRAR BÚSQUEDA CIVIL
          </h3>
          <p className="text-xs text-red-100 mt-2 leading-relaxed">
            Publique una denuncia formal en la base de datos nacional RedActiva para alertar de forma semántica e inteligente a toda la red federal de hospitales y morgues asociadas.
          </p>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="mt-4 w-full bg-white text-[#991b1b] hover:bg-red-50 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border border-white transition shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            {showForm ? "Ocultar Formulario de Denuncia" : "Iniciar Nueva Denuncia"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-slide-up">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wide">
              Formulario Oficial de Persona Desaparecida
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

            <div className="text-xs">
              <label className="block font-bold text-slate-600 mb-1">Nombre Completo *</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Sofía Inés Martínez"
                className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Edad exacta *</label>
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Ej: 23"
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-600 mb-1">Género *</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Estatura estimada</label>
                <input 
                  type="text" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ej: 1.62m"
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-600 mb-1">Peso estimado</label>
                <input 
                  type="text" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej: 54kg"
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-600 mb-1">Cicatrices, Tatuajes, Ropa o Rasgos *</label>
              <textarea 
                rows={3}
                value={distinctiveFeatures}
                onChange={(e) => setDistinctiveFeatures(e.target.value)}
                placeholder="Ej: Cicatriz de corazón en la ceja derecha. Desapareció usando buzo rosa pastel y lentes."
                className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Fecha Desaparición *</label>
                <input 
                  type="date" 
                  value={dateOfDisappearance}
                  onChange={(e) => setDateOfDisappearance(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none text-slate-600"
                  required
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-600 mb-1">Lugar de Extravío *</label>
                <input 
                  type="text" 
                  value={placeOfDisappearance}
                  onChange={(e) => setPlaceOfDisappearance(e.target.value)}
                  placeholder="Ej: Palermo, Buenos Aires"
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-600 mb-1">URL Foto (Opcional)</label>
              <input 
                type="text" 
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Ej: https://..."
                className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Familiar de contacto *</label>
                <input 
                  type="text" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ej: Mariela Gómez"
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-600 mb-1">Teléfono Familiar *</label>
                <input 
                  type="text" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Ej: +54 11 555-2231"
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:ring-1 focus:ring-[#991b1b] focus:outline-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 border-red-950 shadow-md"
            >
              <Heart className="h-4 w-4" />
              Publicar Búsqueda y Buscar Cruces Semánticos
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
