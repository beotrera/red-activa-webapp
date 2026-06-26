import { useState } from "react";
import { Activity, Lock, Mail, ArrowRight, Shield } from "lucide-react";
import { RedActivaUser } from "../types";
import { loginUser } from "../utils/api";

interface LoginProps {
  onLoginSuccess: (user: RedActivaUser) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Complete todos los campos para continuar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await loginUser(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas. Verifique sus datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginUser(quickEmail, quickPass);
      onLoginSuccess(user);
    } catch (err: any) {
      setError("Error de autenticación automática.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">

      {/* ── Institutional header bar ── */}
      <div className="bg-[#7f1d1d] text-white py-2 px-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-red-200">
          Sistema Federal de Búsqueda y Vinculación de Personas · República Argentina · Ministerio de Salud, Justicia y Seguridad
        </p>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">

        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="bg-[#991b1b] text-white p-3 rounded-2xl shadow-lg border-b-2 border-red-950 relative overflow-hidden">
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-200"></span>
            </span>
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Red<span className="text-[#991b1b]">Activa</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
              Conectando vidas en tiempo real
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Autenticación Institucional
            </p>
          </div>

          <div className="px-6 py-6 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-red-50 border border-red-200">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#991b1b] shrink-0" />
                <p className="text-xs text-[#991b1b] font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  E-mail institucional
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agente@redactiva.gob.ar"
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#991b1b] focus:border-[#991b1b] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#991b1b] focus:border-[#991b1b] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#991b1b] hover:bg-red-900 text-white py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-55 mt-1"
              >
                {loading ? "Verificando credenciales..." : "Ingresar al sistema"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <Shield className="h-3 w-3 text-slate-300 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-snug">
                Acceso restringido a personal autorizado. Toda actividad queda registrada.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="border-t border-slate-200 bg-white py-3 text-center">
        <p className="text-[10px] text-slate-400">
          RedActiva · Sistema Federal de Detección y Vinculación de Personas · v1.0
        </p>
      </div>

    </div>
  );
}
