import React, { useState } from "react";
import { Activity, Lock, Mail, Shield, ArrowRight, Fingerprint } from "lucide-react";
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
      setError("Por favor complete todos los campos institucionales.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await loginUser(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Usuario o clave inválida. Revise su terminal.");
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Decorative Atmosphere Gradients (Anti-Slop, Crimson / Rose Glow) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Branding Terminal Element */}
        <div className="flex flex-col items-center">
          <div className="bg-[#991b1b] text-white p-3.5 rounded-2xl shadow-xl border-b-2 border-red-950 relative overflow-hidden">
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-200"></span>
            </span>
            <Activity className="h-7 w-7 text-white" />
          </div>
          
          <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Red<span className="text-[#991b1b] font-medium">Activa</span>
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4 sm:px-0">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-[#991b1b] text-xs font-semibold flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="gap-8">
            
            {/* Left side: Credentials authentication Form */}
            <div className="md:col-span-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-[#991b1b]" />
                  Terminal de Credenciales
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Uso reservado para personal autorizado del Ministerio de Salud, Justicia y Seguridad.</p>
              </div>

              <form onSubmit={handleManualLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    E-mail Institucional
                  </label>
                  <div className="mt-1.5 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="agente@redactiva.gob.ar"
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#991b1b] focus:border-[#991b1b]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Contraseña Federal
                  </label>
                  <div className="mt-1.5 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#991b1b] focus:border-[#991b1b]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-[0.98] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-55"
                >
                  {loading ? "Inicializando Enlace..." : "Autenticar y Establecer Enlace"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Minimal Disclaimer */}
        <p className="text-center text-[10px] text-slate-500 mt-6 leading-relaxed">
          Este portal interactivo sincroniza búsquedas activas con el Sistema Federal de Hospitales. Todo cruzamiento de datos está amparado por las normas regulatorias del Ministerio de Salud.
        </p>

      </div>

    </div>
  );
}
