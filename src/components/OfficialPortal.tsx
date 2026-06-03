import React from "react";
import { Scale, FileText, UserCheck, AlertTriangle, ShieldAlert, BadgeCheck, CheckSquare, Settings, CheckCircle2, XOctagon, Calendar, MapPin } from "lucide-react";
import { MissingPerson, NNAdmission, MatchResult, SystemAlert } from "../types";

interface OfficialPortalProps {
  missingPersons: MissingPerson[];
  nnAdmissions: NNAdmission[];
  matches: MatchResult[];
  alerts: SystemAlert[];
}

export default function OfficialPortal({ missingPersons, nnAdmissions, matches, alerts }: OfficialPortalProps) {
  const confirmedMatches = matches.filter(m => m.status === "Confirmed");
  const rejectedMatches = matches.filter(m => m.status === "Rejected");

  return (
    <div className="space-y-6">
      
      {/* Judicial Seal Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-150 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-full text-red-900 border border-gray-300">
            <Scale className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              Portal de Seguimiento y Auditoría del Caso (Fiscalía / Juzgados)
            </h2>
            <p className="text-xs text-gray-500">Mesa de validación judicial, bitácora de identidad, y confirmación de expedientes de reintegración familiar</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-mono text-right">
          FISCALÍA NACIONAL CLASE: A <br />
          SISTEMA FEDERAL REDACTIVA v1.8
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Confirmed Cases Registry (Expedientes de Reencuentro) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <h3 className="font-bold text-gray-950 flex items-center gap-2 text-sm uppercase tracking-wider">
                <BadgeCheck className="h-5 w-5 text-emerald-600" />
                Historial de Identificación y Vinculación Judicial
              </h3>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                {confirmedMatches.length} Resueltos
              </span>
            </div>

            {confirmedMatches.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500 italic">
                Ninguna coincidencia ha sido corroborada por fiscalía todavía. Diríjase al panel principal para corroborar un cruce de datos.
              </div>
            ) : (
              <div className="space-y-4">
                {confirmedMatches.map(m => {
                  const nn = nnAdmissions.find(n => n.id === m.nnId);
                  const mp = missingPersons.find(person => person.id === m.missingPersonId);
                  
                  if (!mp || !nn) return null;

                  return (
                    <div key={m.id} className="border border-emerald-150 rounded-xl bg-emerald-50/5 p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-gray-900">{mp.fullName}</h4>
                          <p className="text-xs text-gray-400">Expediente ID: #{m.id}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                          Cotejado con Éxito
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3 rounded-lg border text-xs text-gray-700">
                        <div>
                          <span className="font-semibold text-gray-500 block text-[10px] uppercase font-mono mb-1">ORIGEN DENUNCIA</span>
                          <p><strong>Persona:</strong> {mp.fullName} ({mp.age} años)</p>
                          <p className="flex items-center gap-1 mt-1 text-gray-500 leading-normal">
                            <MapPin className="h-3 w-3" /> Desapareció en: {mp.placeOfDisappearance} ({mp.dateOfDisappearance})
                          </p>
                        </div>
                        <div className="border-t sm:border-t-0 sm:border-l border-gray-150 pt-2 sm:pt-0 sm:pl-4">
                          <span className="font-semibold text-gray-500 block text-[10px] uppercase font-mono mb-1">DESTINO INGRESO</span>
                          <p><strong>Centro:</strong> {nn.location}</p>
                          <p className="text-gray-500">Ingreso: {nn.dateOfAdmission}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 border p-2.5 rounded-lg text-xs">
                        <span className="block font-bold text-gray-700 uppercase tracking-widest text-[9px] mb-1">
                          Acreditación y Sentencia de Reintegración
                        </span>
                        <p className="text-gray-600 italic">"{m.validationNotes || "Reconocido formalmente por familiares."}"</p>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono uppercase">
                          <span>Fiscal interviniente: {m.validatedBy}</span>
                          <span>Fecha: {m.validationDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rejected mismatches */}
          {rejectedMatches.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-110 p-6 space-y-4">
              <h3 className="font-bold text-gray-950 flex items-center gap-2 text-sm uppercase tracking-wider border-b pb-3 border-gray-100">
                <XOctagon className="h-5 w-5 text-red-700" />
                Desestimaciones e Incompatibilidades Biométricas
              </h3>
              <div className="space-y-2">
                {rejectedMatches.map(m => {
                  const mp = missingPersons.find(p => p.id === m.missingPersonId);
                  const nn = nnAdmissions.find(n => n.id === m.nnId);

                  return (
                    <div key={m.id} className="text-xs p-3 rounded-lg border border-red-100 bg-red-50/5 flex items-center justify-between justify-wrap">
                      <div>
                        <span className="font-bold text-gray-950">{mp?.fullName || "Búsqueda anterior"}</span> desvinculado de NN en <span className="font-semibold">{nn?.location || "Centro clínico"}</span>.
                        <p className="text-gray-400 mt-1">Causa: {m.validationNotes || "Descartado por cotejo presencial o biométrico directo."}</p>
                      </div>
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                        DESCARTADO
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Audit Log / Audits list */}
        <div className="space-y-4">
          <div className="bg-gray-900 text-gray-100 rounded-xl p-6 shadow-md border-b-4 border-gray-950">
            <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
              <ShieldAlert className="h-5 w-5 text-gray-300" />
              Bitácora Auditoría Técnica
            </h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Monitorea los accesos de datos, alertas emitidas, y logs del motor neuronal de concordancia global.
            </p>
            <div className="mt-4 space-y-3 font-mono text-[10px] text-gray-400 max-h-80 overflow-y-auto">
              {alerts.map((al, idx) => (
                <div key={al.id || idx} className="border-b border-gray-800 pb-2 space-y-1">
                  <div className="flex justify-between text-gray-500">
                    <span>[{al.timestamp.slice(11, 19)}] SYS_LOG</span>
                    <span>SUCCESS</span>
                  </div>
                  <p className="text-gray-300">{al.title}</p>
                  <p className="text-gray-500 leading-normal">{al.message}</p>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-800 border-dashed text-gray-600">
                &gt;&gt; MONITOR DE CRUCE ACTIVO <br />
                &gt;&gt; PUERTO DE ENTRADA CORREGIDO <br />
                &gt;&gt; 100% OPERATIVO
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
