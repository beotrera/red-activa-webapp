import { SystemAlert } from "../types";
import { Bell, X } from "lucide-react";

interface AlertsDrawerProps {
  alerts: SystemAlert[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onDismiss: (alertId: string) => void;
  onViewDetail: (nnId: string) => void;
}

export default function AlertsDrawer({ alerts, onClose, onMarkAllRead, onDismiss, onViewDetail }: AlertsDrawerProps) {
  return (
    <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-950">
        <div className="flex items-center gap-1.5">
          <Bell className="h-4 w-4 animate-pulse text-slate-300" />
          <h3 className="font-bold text-xs uppercase tracking-wider">Bitácora de Alertas Activas</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onMarkAllRead}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold py-0.5 px-2 rounded cursor-pointer"
          >
            Visto Todos
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex-grow overflow-y-auto space-y-3.5">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs italic">
            Ninguna notificación en la bitácora activa del sistema.
          </div>
        ) : (
          alerts.map((al) => (
            <div
              key={al.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                al.read
                  ? "bg-slate-50/50 border-slate-200 text-slate-400"
                  : "bg-white border-slate-200 text-slate-900 shadow-sm"
              }`}
            >
              <div>
                <div className="flex justify-between items-start text-xs font-mono tracking-wider font-bold">
                  <span className={al.type === "match_alert" ? "text-amber-600" : "text-slate-500"}>
                    {al.type === "match_alert" ? "COINCIDENCIA RECIENTE" : "NOTIFICACIÓN CENTRAL"}
                  </span>
                  <span className="text-slate-400">{new Date(al.timestamp).toLocaleTimeString()}</span>
                </div>
                <h4 className="text-xs font-bold mt-1 text-slate-900 leading-snug">{al.title}</h4>
                <p className="text-sm text-slate-500 mt-0.5 leading-normal">{al.message}</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 gap-2">
                {al.nnId && (
                  <button
                    onClick={() => { onViewDetail(al.nnId!); onClose(); }}
                    className="text-xs bg-slate-900 text-white font-bold py-1 px-2.5 rounded hover:bg-slate-800 cursor-pointer"
                  >
                    Verificar en Ficha
                  </button>
                )}
                <button
                  onClick={() => onDismiss(al.id)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium ml-auto cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-400">
        Dispositivo de coordinación RedActiva. Todos los derechos reservados.
      </div>
    </div>
  );
}
