import React, { useState } from "react";
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  User, 
  Calendar, 
  ArrowRight, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Users, 
  Hospital, 
  Hourglass,
  Clock,
  ExternalLink
} from "lucide-react";
import { MissingPerson, NNAdmission, MatchResult } from "../types";

interface DashboardProps {
  missingPersons: MissingPerson[];
  nnAdmissions: NNAdmission[];
  matches: MatchResult[];
  onValidateMatch: (matchId: string, status: 'Confirmed' | 'Rejected', notes?: string) => void;
  onSelectTab: (tabId: string) => void;
}

export default function Dashboard({ 
  missingPersons, 
  nnAdmissions, 
  matches, 
  onValidateMatch,
  onSelectTab
}: DashboardProps) {
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [validationNotes, setValidationNotes] = useState("");
  const [showValidationForm, setShowValidationForm] = useState(false);
  const [simulatedDialer, setSimulatedDialer] = useState<{name: string, phone: string} | null>(null);

  // Filter pending matches
  const pendingMatches = matches.filter(m => m.status === "Pending" || m.status === "Validating");
  const confirmedMatches = matches.filter(m => m.status === "Confirmed");

  // Counter stats
  const activeSearching = missingPersons.filter(mp => mp.status === "Searching").length;
  const activeNN = nnAdmissions.filter(nn => nn.status !== "Identified").length;
  const totalMatchesNum = pendingMatches.length;
  const resolvedCasesCount = missingPersons.filter(mp => mp.status === "Resolved" || mp.status === "Found").length;

  const handleStartReview = (match: MatchResult) => {
    setSelectedMatch(match);
    setShowValidationForm(true);
    setValidationNotes("");
  };

  const handleConfirmMatchSubmit = () => {
    if (selectedMatch) {
      onValidateMatch(selectedMatch.id, "Confirmed", validationNotes);
      setShowValidationForm(false);
      setSelectedMatch(null);
    }
  };

  const handleRejectMatchSubmit = () => {
    if (selectedMatch) {
      onValidateMatch(selectedMatch.id, "Rejected", "Descartado por fiscal o auditor: " + validationNotes);
      setShowValidationForm(false);
      setSelectedMatch(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Bento Indicators - Summary Card Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">Altas de Búsqueda Activas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeSearching}</h3>
            <p className="text-xs text-slate-400 mt-1">Denuncias en curso</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-100">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">Ingresos NN sin Identificar</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeNN}</h3>
            <button 
              onClick={() => onSelectTab("nn")}
              className="text-xs text-slate-900 hover:underline mt-1.5 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Ver ingresos <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-100">
            <Hospital className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">Coincidencias de IA</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalMatchesNum}</h3>
            <p className="text-xs text-amber-600 font-semibold mt-1">Pendiente de verificación</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 animate-pulse">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl shadow-sm flex items-center justify-between text-white">
          <div>
            <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest text-[#a7f3d0]">Vínculos Resueltos</p>
            <h3 className="text-2xl font-bold text-white mt-1">{resolvedCasesCount}</h3>
            <p className="text-xs text-[#a7f3d0]/80 font-medium mt-1">Familias reencontradas</p>
          </div>
          <div className="p-3 bg-slate-800 text-[#a7f3d0] rounded-xl border border-slate-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* 2. Intelligent Auto-Matcher Platform Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Panel Header */}
        <div className="bg-slate-900 px-6 py-4.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-950 text-white">
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-700 text-white animate-pulse">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">Motor de Cruce Neuronal Inteligente</h2>
              <p className="text-xs text-slate-400">Monitoreo automático de ingresos clínicos y policiales en tiempo real</p>
            </div>
          </div>
          <div className="text-right text-[10px] bg-slate-850 border border-slate-850 px-3 py-1 rounded-md font-mono text-emerald-400">
            Cruce de datos activo ● 2026
          </div>
        </div>

        {/* Content body */}
        <div className="p-6">
          {pendingMatches.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No hay coincidencias pendientes</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                El sistema ha cotejado todos los registros. Las personas reportadas están resueltas o no concuerdan con los pacientes NN ingresados.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {pendingMatches.map((match) => {
                const nn = nnAdmissions.find(n => n.id === match.nnId);
                const mp = missingPersons.find(m => m.id === match.missingPersonId);

                if (!nn || !mp) return null;

                const isCritical = match.confidence >= 85;

                return (
                  <div 
                    key={match.id}
                    id={`match-card-${match.id}`}
                    className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                      isCritical ? "border-slate-300 bg-white shadow-md ring-1 ring-slate-900" : "border-slate-200 bg-white hover:border-slate-450 shadow-sm"
                    }`}
                  >
                    {/* Header of Pairing */}
                    <div className={`px-4 py-2.5 flex items-center justify-between text-xs font-mono font-bold border-b ${
                      isCritical ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-slate-50 border-slate-100 text-slate-600"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <Hourglass className="h-3.5 w-3.5 animate-spin text-slate-900" />
                        <span>COINCIDENCIA DETECTADA EN COLA</span>
                      </div>
                      
                      {/* Confidence Gauge Badge */}
                      <div className="flex items-center gap-2">
                        <span>CONFIDENCIA:</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isCritical ? "bg-slate-900 text-white animate-pulse" : "bg-slate-200 text-slate-800"
                        }`}>
                          {match.confidence}%
                        </span>
                      </div>
                    </div>

                    {/* Split View Comparison */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-150">
                      
                      {/* Left: Unidentified Individual Admission (HH / Clinicas) */}
                      <div className="space-y-3 pb-3 md:pb-0 md:pr-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-800 text-[9px] uppercase font-mono font-semibold px-2 py-0.5 rounded">
                            Adyacente NN Clínica / Policial
                          </span>
                          <span className="text-[11px] text-slate-400">ID: {nn.id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                          <User className="h-4.5 w-4.5 text-slate-600" />
                          NN de aprox. {nn.estimatedAge} años ({nn.gender})
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-450 block font-mono text-[9px] uppercase">Lugar de ingreso</span>
                            <span className="font-semibold text-slate-850 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 inline text-slate-600" /> {nn.location}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-450 block font-mono text-[9px] uppercase">Fecha y Hora de ingreso</span>
                            <span className="font-semibold text-slate-850 flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3 inline text-slate-500" /> {nn.dateOfAdmission}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-150">
                          <span className="text-slate-700 font-mono text-[9px] uppercase font-bold block mb-1">Rasgos Particulares Detectados</span>
                          <p className="text-slate-600 italic">"{nn.distinctiveFeatures}"</p>
                        </div>
                        
                        {nn.notes && (
                          <p className="text-xs text-slate-500">
                            <span className="font-bold">Observación:</span> {nn.notes}
                          </p>
                        )}
                      </div>

                      {/* Right: Missing Person Search Report */}
                      <div className="space-y-3 pt-3 md:pt-0 md:pl-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="bg-slate-100 text-slate-800 text-[9px] uppercase font-mono font-semibold px-2 py-0.5 rounded">
                              Reporte de Desaparecido Coincidente
                            </span>
                            <span className="text-[11px] text-slate-400">ID: {mp.id}</span>
                          </div>
                          <div className="flex gap-3 mt-2">
                            {mp.photoUrl && (
                              <img 
                                src={mp.photoUrl} 
                                alt={mp.fullName} 
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div>
                              <h4 className="text-sm font-bold text-slate-950 hover:underline cursor-pointer flex items-center gap-2">
                                {mp.fullName}
                              </h4>
                              <p className="text-xs text-slate-500">Edad: {mp.age} años | Género: {mp.gender}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-slate-450 block font-mono text-[9px] uppercase">Visto por última vez en</span>
                              <span className="font-semibold text-slate-850 mt-0.5 block">{mp.placeOfDisappearance}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-slate-450 block font-mono text-[9px] uppercase">Fecha de desaparición</span>
                              <span className="font-semibold text-slate-850 mt-0.5 block">{mp.dateOfDisappearance}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-150 mt-2">
                            <span className="text-slate-700 font-mono text-[9px] uppercase font-bold block mb-1">Cicatrices, Marcas o Tatuajes</span>
                            <p className="text-slate-600 italic">"{mp.distinctiveFeatures}"</p>
                          </div>
                        </div>

                        {/* Contact details */}
                        <div className="bg-slate-50 p-2 rounded-lg flex items-center justify-between text-xs mt-3 border border-slate-150">
                          <div>
                            <span className="text-slate-500 font-medium block">Familiar de contacto:</span>
                            <span className="font-bold text-slate-800">{mp.contactName} ({mp.contactPhone})</span>
                          </div>
                          <button 
                            onClick={() => setSimulatedDialer({ name: mp.contactName, phone: mp.contactPhone })}
                            className="bg-slate-900 text-white p-1.5 rounded-md hover:bg-slate-850 cursor-pointer transition-colors"
                            title="Llamar familiar para cotejo de datos"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </button>
                        </div>

                      </div>

                    </div>

                    {/* AI Reasons / Why did it match? */}
                    <div className="bg-gray-50 p-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-700">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span>¿POR QUÉ COINCIDEN? (Análisis Morfológico-Semántico):</span>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-600 pl-4 list-disc">
                        {match.reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action buttons footer */}
                    <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-slate-400 italic">
                        Sistema aconseja verificar presencialmente con resguardo de datos filiatorios de familiares.
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedMatch(match);
                            onValidateMatch(match.id, "Rejected", "Descartado temporalmente en cotejo básico.");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-250 text-slate-500 text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Descartar Cruce
                        </button>
                        <button 
                          onClick={() => handleStartReview(match)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Validar y Vincular Caso
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}

            </div>
          )}
        </div>

      </div>

      {/* 3. Confirmed matches list (Casos recientemente vinculados exitosamente) */}
      {confirmedMatches.length > 0 && (
        <div className="bg-slate-100/55 rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-[#065f46]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Historial Reciente de Vinculaciones Exitosas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedMatches.map(m => {
              const nn = nnAdmissions.find(n => n.id === m.nnId);
              const mp = missingPersons.find(person => person.id === m.missingPersonId);
              if (!mp || !nn) return null;

              return (
                <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{mp.fullName}</h4>
                    <p className="text-xs text-slate-500 mt-1">Identificado en {nn.location}</p>
                    <p className="text-[10px] text-emerald-750 font-mono mt-2 uppercase">✓ Validado por: {m.validatedBy}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-50 text-green-700 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md">
                      ENTREGADO / VINCULADO
                    </span>
                    <p className="text-[10px] text-slate-450 mt-1">{m.validationDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Manual / Legal Verification Modal or Dialog sheet */}
      {showValidationForm && selectedMatch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-slide-up">
            
            <div className="bg-slate-900 p-4.5 text-white flex items-center justify-between border-b border-slate-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Validación Oficial Fiscalía General</h3>
              </div>
              <button 
                onClick={() => setShowValidationForm(false)}
                className="text-slate-400 hover:text-white bg-transparent p-1 sm:p-2 rounded cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Está a punto de corroborar la vinculación filiatoria legal. Esta acción cerrará la alerta de seguridad, marcará al paciente del centro clínico como **Identificado**, y designará la búsqueda en la sección ciudadana como **Caso Resuelto**.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-xs text-slate-705 space-y-1">
                <p><strong>Persona Desaparecida:</strong> {missingPersons.find(m => m.id === selectedMatch.missingPersonId)?.fullName}</p>
                <p><strong>Paciente NN Destino:</strong> Inh. en {nnAdmissions.find(n => n.id === selectedMatch.nnId)?.location}</p>
                <p><strong>Grado de Similitud IA:</strong> {selectedMatch.confidence}%</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest mb-1.5">
                  Notas de Cotejo Biométrico o Familiar
                </label>
                <textarea 
                  rows={3}
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Ej: Se convocó a la hija Mariela Gómez al hospital. Confirmó identidad mediante reconocimiento facial de rasgos. Huellas digitales corroboradas por policía científica."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  onClick={handleRejectMatchSubmit}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                >
                  No Coincide (Rechazar Cruce)
                </button>
                <button 
                  onClick={handleConfirmMatchSubmit}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  ✓ Confirmar e Vincular Identidad
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. Dialer Simulator Dashboard Feature */}
      {simulatedDialer && (
        <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-950 text-white rounded-2xl shadow-2xl p-4 w-72 z-50 animate-bounce-short">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] text-amber-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 animate-pulse" /> LLAMADA SALIENTE
            </span>
            <button 
              onClick={() => setSimulatedDialer(null)}
              className="text-slate-400 hover:text-white text-xs bg-transparent border-0 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          <div className="py-3 text-center">
            <p className="text-sm font-semibold text-slate-200">{simulatedDialer.name}</p>
            <p className="text-xs text-slate-400 font-mono my-1">{simulatedDialer.phone}</p>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md inline-block mt-2">
              Llamando familiar...
            </span>
          </div>
          <div className="flex justify-around pt-2">
            <button 
              onClick={() => setSimulatedDialer(null)}
              className="bg-slate-850 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg w-full cursor-pointer transition-colors font-semibold"
            >
              Cortar Conexión
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
