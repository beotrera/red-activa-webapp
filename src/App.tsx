import React, { useState } from "react";
import { MissingPerson, NNAdmission, MatchResult, SystemAlert, NNGender, ConsciousnessLevel, NNStatus } from "./types";
import { useAppDispatch, useAppSelector } from "./hooks/useAppDispatch";
import { loginSuccess, logout } from "./store/authSlice";
import {
  usePersons,
  useCreateNNAdmission,
  useCreateMissingPerson,
  useValidateMatch,
  useMarkAlertRead,
} from "./hooks/useApi";
import Header from "./components/Header";
import Login from "./components/Login";
import {
  Activity,
  Hospital,
  Users,
  Scale,
  PlusCircle,
  Search,
  Heart,
  Calendar,
  Phone,
  MapPin,
  User,
  Check,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Radio,
  Bell,
  Trash2,
  CheckCircle2,
  FileText,
  Camera,
  Image
} from "lucide-react";

export default function App() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const { data: nnAdmissions = [], isLoading: loadingNN, isError: personsError } = usePersons(!!currentUser);

  const missingPersons: MissingPerson[] = [];
  const matches: MatchResult[] = [];
  const alerts: SystemAlert[] = [];
  const loading = loadingNN;
  const error = personsError ? "No se pudo conectar con el servidor. Reintentando..." : null;

  const createNNMutation = useCreateNNAdmission();
  const createMPMutation = useCreateMissingPerson();
  const validateMatchMutation = useValidateMatch();
  const markAlertMutation = useMarkAlertRead();

  // UX controls
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | NNStatus>("all");
  const [expandedNNId, setExpandedNNId] = useState<string | null>("nn-1"); // Pre-expand nn-1 to show the tracking UI instantly!
  const [activeView, setActiveView] = useState<"list" | "admission">("list");
  const [showMissingModal, setShowMissingModal] = useState<boolean>(false);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState<boolean>(false);

  // Form Fields for new NN Admission
  const [nnAge, setNnAge] = useState("");
  const [nnGender, setNnGender] = useState<NNGender>(NNGender.MALE);
  const [nnHeight, setNnHeight] = useState("");
  const [nnWeight, setNnWeight] = useState("");
  const [nnDistinctiveFeatures, setNnDistinctiveFeatures] = useState("");
  const [nnConsciousness, setNnConsciousness] = useState<ConsciousnessLevel>(ConsciousnessLevel.DISORIENTED);
  const [nnNotes, setNnNotes] = useState("");
  const [nnFormSuccess, setNnFormSuccess] = useState("");
  const [nnFormError, setNnFormError] = useState("");

  // Identifying photos (File objects — uploaded via multipart)
  const [nnPhotos, setNnPhotos] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; uploadedAt?: string } | null>(null);

  // Form Fields for new Missing Person Modal
  const [mpFullName, setMpFullName] = useState("");
  const [mpAge, setMpAge] = useState("");
  const [mpGender, setMpGender] = useState<"Masculino" | "Femenino" | "Otro">("Masculino");
  const [mpHeight, setMpHeight] = useState("");
  const [mpWeight, setMpWeight] = useState("");
  const [mpFeatures, setMpFeatures] = useState("");
  const [mpDate, setMpDate] = useState("");
  const [mpPlace, setMpPlace] = useState("");
  const [mpContactName, setMpContactName] = useState("");
  const [mpContactPhone, setMpContactPhone] = useState("");
  const [mpPhotoUrl, setMpPhotoUrl] = useState("");
  const [mpNotes, setMpNotes] = useState("");
  const [mpFormSuccess, setMpFormSuccess] = useState("");
  const [mpFormError, setMpFormError] = useState("");

  // Inline Match resolution states (per-item)
  const [validationNotes, setValidationNotes] = useState<{ [matchId: string]: string }>({});

  const handleLoginSuccess = (user: typeof currentUser) => {
    if (!user) return;
    dispatch(loginSuccess(user));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleRegisterNN = async (e: React.FormEvent) => {
    e.preventDefault();
    setNnFormError("");
    setNnFormSuccess("");

    if (!nnAge || !nnDistinctiveFeatures) {
      setNnFormError("Por favor complete los campos obligatorios (*)");
      return;
    }

    createNNMutation.mutate(
      {
        estimatedAge: Number(nnAge),
        gender: nnGender,
        height: nnHeight || "No especificada",
        weight: nnWeight || "No especificado",
        distinctiveFeatures: nnDistinctiveFeatures,
        consciousnessLevel: nnConsciousness,
        notes: nnNotes || undefined,
        images: nnPhotos.length > 0 ? nnPhotos : undefined,
      },
      {
        onSuccess: () => {
          setNnFormSuccess("¡Registro de ingreso NN ingresado con éxito!");
          setNnAge("");
          setNnGender(NNGender.MALE);
          setNnHeight("");
          setNnWeight("");
          setNnDistinctiveFeatures("");
          setNnConsciousness(ConsciousnessLevel.DISORIENTED);
          setNnNotes("");
          setNnPhotos([]);
        },
        onError: () => setNnFormError("No se pudo registrar el ingreso NN"),
      }
    );
  };

  const handleRegisterMissing = async (e: React.FormEvent) => {
    e.preventDefault();
    setMpFormError("");
    setMpFormSuccess("");

    if (!mpFullName || !mpAge || !mpFeatures || !mpDate || !mpPlace) {
      setMpFormError("Por favor complete los campos obligatorios (*)");
      return;
    }

    createMPMutation.mutate(
      {
        fullName: mpFullName,
        age: Number(mpAge),
        gender: mpGender,
        height: mpHeight || "No especificada",
        weight: mpWeight || "No especificado",
        distinctiveFeatures: mpFeatures,
        dateOfDisappearance: mpDate,
        placeOfDisappearance: mpPlace,
        contactName: mpContactName || "Anónimo",
        contactPhone: mpContactPhone || "No especificada",
        photoUrl: mpPhotoUrl || undefined,
        notes: mpNotes,
      },
      {
        onSuccess: () => {
          setMpFormSuccess("¡Búsqueda registrada correctamente!");
          setMpFullName("");
          setMpAge("");
          setMpGender("Masculino");
          setMpHeight("");
          setMpWeight("");
          setMpFeatures("");
          setMpDate("");
          setMpPlace("");
          setMpContactName("");
          setMpContactPhone("");
          setMpNotes("");
          setMpPhotoUrl("");
          setTimeout(() => {
            setShowMissingModal(false);
            setMpFormSuccess("");
          }, 2000);
        },
        onError: () => setMpFormError("Error al registrar reporte de búsqueda ciudadana"),
      }
    );
  };

  const handleValidateMatchSubmit = (matchId: string, status: 'Confirmed' | 'Rejected') => {
    const notes = validationNotes[matchId] || "";
    const auditSignature = `${currentUser?.fullName} (${currentUser?.role} - ${currentUser?.entity.split(" ")[0]})`;
    validateMatchMutation.mutate(
      { matchId, status, validatedBy: auditSignature, notes: notes || "Cotejado biométricamente y homologado judicialmente." },
      { onError: () => alert("Error al tramitar la homologación judicial") }
    );
  };

  const handleMarkAllRead = () => {
    markAlertMutation.mutate("all");
  };

  const handleDismissAlert = (alertId: string) => {
    markAlertMutation.mutate(alertId);
  };

  // Filter admissions based on search term & status badge selection
  const filteredAdmissions = nnAdmissions.filter(ad => {
    const searchString = `${ad.location} ${ad.distinctiveFeatures} ${ad.estimatedAge} ${ad.gender} ${ad.reportedBy}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === ad.status) return matchesSearch;
    return false;
  });

  const unreadAlerts = alerts.filter(a => !a.read);

  // Key visual statistics (minimal bar widgets)
  const activeSearchingCount = missingPersons.filter(mp => mp.status === "Searching").length;
  const activeNNCount = nnAdmissions.filter(nn => nn.status !== NNStatus.IDENTIFIED).length;
  const resolvedCasesCount = missingPersons.filter(mp => mp.status === "Resolved" || mp.status === "Found").length;

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none antialiased">

      {/* 1. Top Header */}
      <Header
        alerts={alerts}
        onAlertClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
        onMarkAllRead={handleMarkAllRead}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-grow flex flex-col gap-6">

        {error && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl text-amber-900 flex items-center gap-3 text-xs font-semibold shadow-sm animate-pulse">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation is positioned cleanly directly under workspace headers */}

        {/* Dynamic Navigation Tabs (Separation of Concerns and Clean Minimalism) */}
        <div className="flex border-b border-slate-200 space-x-6 sm:space-x-8 mt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveView("list")}
            className={`pb-3 px-1 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeView === "list"
                ? "border-[#991b1b] text-[#991b1b] font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
          >
            📋 Expedientes y Seguimiento NN
          </button>
          <button
            onClick={() => setActiveView("admission")}
            className={`pb-3 px-1 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeView === "admission"
                ? "border-[#991b1b] text-[#991b1b] font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
          >
            🏥 Cargar Nuevo Ingreso NN
          </button>
        </div>

        {/* Core Screen Split Panel */}
        <div className={`grid grid-cols-1 ${activeView === "admission" ? "max-w-xl mx-auto w-full" : "w-full"} gap-6 items-start`}>

          {/* LEFT COLUMN: Input form for New NN Admissions (Carga de NN) */}
          <div className={`space-y-4 transition-all duration-300 ${activeView === "admission" ? "block w-full animate-fade-in" : "hidden"}`}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Hospital className="h-4.5 w-4.5 text-slate-800" />
                      Carga Rápida de Ingreso NN
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                      Vía Guardia
                    </span>
                  </div>

                  {nnFormError && (
                    <div className="bg-red-50 text-red-800 p-2 text-[11px] rounded-lg border border-red-100 italic">
                      {nnFormError}
                    </div>
                  )}

                  {nnFormSuccess && (
                    <div className="bg-green-50 text-green-800 p-2 text-[11px] rounded-lg border border-green-100 font-medium">
                      {nnFormSuccess}
                    </div>
                  )}

                  <form onSubmit={handleRegisterNN} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Edad Est. *</label>
                        <input
                          type="number"
                          placeholder="Ej: 42"
                          value={nnAge}
                          onChange={(e) => setNnAge(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Género *</label>
                        <select
                          value={nnGender}
                          onChange={(e) => setNnGender(e.target.value as NNGender)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                        >
                          <option value={NNGender.MALE}>Masculino</option>
                          <option value={NNGender.FEMALE}>Femenino</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Estatura aprox.</label>
                        <input
                          type="text"
                          placeholder="Ej: 1.75m"
                          value={nnHeight}
                          onChange={(e) => setNnHeight(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Peso aprox.</label>
                        <input
                          type="text"
                          placeholder="Ej: 80kg"
                          value={nnWeight}
                          onChange={(e) => setNnWeight(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nivel de Conciencia *</label>
                      <select
                        value={nnConsciousness}
                        onChange={(e) => setNnConsciousness(e.target.value as ConsciousnessLevel)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                      >
                        <option value={ConsciousnessLevel.DISORIENTED}>Desorientado (Amnesia / Confuso)</option>
                        <option value={ConsciousnessLevel.CONSCIOUS}>Consciente (Orientado)</option>
                        <option value={ConsciousnessLevel.UNCONSCIOUS}>Inconsciente / Coma</option>
                        <option value={ConsciousnessLevel.SEDATED}>Sedado farmacológicamente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Rasgos, Señas o Ropa *</label>
                      <textarea
                        rows={2.5}
                        placeholder="Ej: Tatuaje de rosa azul en antebrazo izquierdo, viste buzo negro y zapatillas rojas..."
                        value={nnDistinctiveFeatures}
                        onChange={(e) => setNnDistinctiveFeatures(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none leading-relaxed"
                        required
                      />
                    </div>

                    {/* Evidencia Visual — upload real de archivos */}
                    <div className="p-3 bg-red-50/20 border border-red-150/40 rounded-xl space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-red-150/30 pb-2">
                        <Camera className="h-4 w-4 text-[#991b1b]" />
                        <span className="text-[10px] font-bold text-[#991b1b] uppercase tracking-wider">
                          Fotos (Tatuajes / Marcas / Cicatrices)
                        </span>
                        {nnPhotos.length > 0 && (
                          <span className="ml-auto text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {nnPhotos.length} archivo{nnPhotos.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Preview de archivos seleccionados */}
                      {nnPhotos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {nnPhotos.map((file, idx) => (
                            <div key={idx} className="relative rounded-lg border border-[#991b1b]/20 overflow-hidden bg-white shadow-sm flex flex-col">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="h-16 w-full object-cover"
                              />
                              <div className="p-1 text-[8px] text-slate-500 line-clamp-1 bg-slate-50 leading-snug">
                                {file.name}
                              </div>
                              <button
                                type="button"
                                onClick={() => setNnPhotos(nnPhotos.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition cursor-pointer"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Drag & Drop / file selector */}
                      <div
                        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          const files = Array.from<File>(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                          if (files.length) setNnPhotos(prev => [...prev, ...files]);
                        }}
                        className={`border-2 border-dashed rounded-xl p-3 text-center transition ${dragActive ? "border-[#991b1b] bg-red-50/40" : "border-slate-200 hover:border-[#991b1b]/30"}`}
                      >
                        <label className="cursor-pointer block space-y-1">
                          <Image className="mx-auto h-5 w-5 text-slate-400" />
                          <div className="text-[10px] text-slate-700 font-semibold">
                            Arrastre aquí o{" "}
                            <span className="text-[#991b1b] underline">seleccione archivos</span>
                          </div>
                          <p className="text-[8px] text-slate-400">JPG / PNG / WEBP — hasta 10 archivos, 5 MB c/u</p>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []);
                              if (files.length) setNnPhotos(prev => [...prev, ...files]);
                              e.target.value = "";
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Notas Clínicas Adicionales</label>
                      <textarea
                        rows={1.5}
                        placeholder="Notas médicas o psiquiátricas complementarias..."
                        value={nnNotes}
                        onChange={(e) => setNnNotes(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Hospital className="h-4 w-4" />
                      Registrar e Iniciar Cotejo
                    </button>
                  </form>
                </>
            </div>
          </div>

          {/* RIGHT COLUMN: Searchable visualization of patients + integrated case tracking / follow-up */}
          <div className={`space-y-4 ${activeView === "list" ? "block w-full animate-fade-in" : "hidden"}`}>

            {/* Action toolbelt (Search and launchers) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Búsqueda e Inteligencia de Coincidencias en Pacientes NN
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Examine ingresos no identificados, verifique de forma semántica sus coincidencias y firme la homologación judicial del caso.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveView("admission")}
                    className="bg-red-50 hover:bg-red-100 text-[#991b1b] border border-red-200 font-bold text-[11px] px-3.5 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1.5"
                    title="Cargar Nuevo Ingreso NN"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Admitir Paciente NN
                  </button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por hospital, marcas corporales, rasgos particulares..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="all">Ver: Todos los Casos</option>
                  <option value={NNStatus.UNIDENTIFIED}>Ver: Sin Identificar aún</option>
                  <option value={NNStatus.POTENTIAL_MATCH}>Ver: Con Coincidencias</option>
                  <option value={NNStatus.IDENTIFIED}>Ver: Resueltos / Identificados</option>
                </select>
              </div>
            </div>

            {/* List entries */}
            <div className="space-y-4">
              {filteredAdmissions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs italic">
                  No se registraron coincidencias médicas cargadas actualmente con el filtro seleccionado.
                </div>
              ) : (
                filteredAdmissions.map((ad) => {
                  const isExpanded = expandedNNId === ad.id;

                  // Query matches linked to this specific NN admission
                  const nnMatches = matches.filter(m => m.nnId === ad.id);
                  const activeMatch = nnMatches.find(m => m.status === 'Pending' || m.status === 'Validating' || m.status === 'Confirmed');

                  return (
                    <div
                      key={ad.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${ad.status === NNStatus.IDENTIFIED
                          ? "border-emerald-200 bg-slate-50/40 opacity-90"
                          : ad.status === NNStatus.POTENTIAL_MATCH
                            ? "border-amber-300 ring-1 ring-amber-200 shadow-sm"
                            : "border-slate-200 hover:border-slate-350"
                        }`}
                    >
                      {/* Top indicator of the card */}
                      <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className={`p-2.5 rounded-xl border ${ad.status === NNStatus.IDENTIFIED
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ad.status === NNStatus.POTENTIAL_MATCH
                                ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}>
                            <Hospital className="h-5 w-5" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-950">
                                NN de aprox. {ad.estimatedAge} años ({ad.gender})
                              </h4>

                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${ad.status === NNStatus.IDENTIFIED
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : ad.status === NNStatus.POTENTIAL_MATCH
                                    ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                                    : "bg-slate-100 text-slate-600"
                                }`}>
                                {ad.status === NNStatus.IDENTIFIED ? "✓ IDENTIFICADO" : ad.status === NNStatus.POTENTIAL_MATCH ? "🔍 COINCIDENCIA" : "SIN IDENTIFICAR"}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-450" /> {ad.location}
                            </p>
                            <p className="text-[10px] text-slate-400">Ingreso reportado: {ad.dateOfAdmission} por {ad.reportedBy}</p>
                          </div>
                        </div>

                        {/* Collapsing arrow */}
                        <button
                          onClick={() => setExpandedNNId(isExpanded ? null : ad.id)}
                          className="bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-slate-500 cursor-pointer transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Brief preview description always shown */}
                      <div className="px-5 pb-4">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Cuerpo e Indicios Particulares</span>
                          <p className="text-xs text-slate-700 italic">"{ad.distinctiveFeatures}"</p>

                          {/* Connecting Identifying Photos Gallery for Tattoos & Marks */}
                          {ad.identifyingPhotos && ad.identifyingPhotos.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200/55 space-y-1.5">
                              <span className="text-[9px] text-[#991b1b] font-bold block uppercase tracking-wider">
                                Galería de Evidencia (Tatuajes / Marcas)
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {ad.identifyingPhotos.map((photo, pIdx) => (
                                  <button
                                    type="button"
                                    key={pIdx}
                                    onClick={() => setLightboxPhoto(photo)}
                                    className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs focus:outline-none focus:ring-1 focus:ring-[#991b1b] cursor-pointer transition hover:border-[#991b1b]/50"
                                  >
                                    <div className="aspect-square relative w-full overflow-hidden bg-slate-50">
                                      <img
                                        src={photo.url}
                                        alt="Evidencia"
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                                        <span className="text-white text-[8px] font-bold uppercase tracking-wider bg-slate-900/85 px-2 py-0.5 rounded">
                                          Ampliar
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-2.5 flex flex-wrap gap-4 items-center text-[10px] text-slate-450 pt-2.5 border-t border-slate-200/55">
                            <span>Conciencia: <strong className="text-slate-700">{ad.consciousnessLevel}</strong></span>
                            <span>Estatura: <strong className="text-slate-700">{ad.height}</strong></span>
                            <span>Peso: <strong className="text-slate-700">{ad.weight}</strong></span>
                            {ad.assignedTo && <span>Designado a: <strong className="text-[#991b1b] bg-red-50 border border-red-150 px-2 py-0.5 rounded-md font-extrabold uppercase text-[9px] inline-block">{ad.assignedTo}</strong></span>}
                            {ad.notes && <span>Notas: <strong className="text-slate-700 italic">{ad.notes}</strong></span>}
                          </div>
                        </div>

                        {/* Bottom action bar */}
                        <div className="mt-4 flex items-center justify-between">
                          <button
                            onClick={() => setExpandedNNId(isExpanded ? null : ad.id)}
                            className="text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1.5 focus:outline-none"
                          >
                            <span>{isExpanded ? "Ocultar Seguimiento" : "Ver Seguimiento y Cruces de Datos"}</span>
                            {nnMatches.length > 0 && (
                              <span className="bg-slate-900 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                {nnMatches.length}
                              </span>
                            )}
                          </button>

                          {ad.status === NNStatus.IDENTIFIED && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Caso Homologado por Fiscalía
                            </span>
                          )}
                        </div>
                      </div>

                      {/* EXPANDED PANEL: Integrated Tracking (Seguimiento, matches & direct validation action) */}
                      {isExpanded && (
                        <div className="bg-slate-50 border-t border-slate-150 p-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h5 className="text-[11px] font-bold tracking-wider text-slate-800 uppercase flex items-center gap-1.5">
                              <Scale className="h-4 w-4 text-slate-700" />
                              Expediente Judicial Integrado y Cruce de Personas
                            </h5>
                            <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                              Caso ID: #{ad.id}
                            </span>
                          </div>

                          {/* Render Matches or state if no match */}
                          {nnMatches.length === 0 ? (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-500 italic flex flex-col items-center justify-center space-y-2">
                              <Search className="h-5 w-5 text-slate-400" />
                              <p>Sin coincidencias registradas en la base de datos nacional.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {nnMatches.map((match) => {
                                const mp = missingPersons.find(p => p.id === match.missingPersonId);
                                if (!mp) return null;

                                return (
                                  <div key={match.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-slate-800">
                                          Coincidencia Estimada:
                                        </span>
                                        <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-full ${match.confidence >= 85 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                                          }`}>
                                          {match.confidence}%
                                        </span>
                                      </div>

                                      <span className={`text-[10px] tracking-wide uppercase font-bold text-slate-500`}>
                                        Estado: <strong className={match.status === 'Confirmed' ? "text-green-700" : "text-amber-600"}>{match.status === 'Confirmed' ? "HOMOLOGADO" : match.status === 'Rejected' ? "DESCARTADO" : "PENDIENTE VERIFICACIÓN"}</strong>
                                      </span>
                                    </div>

                                    {/* Main comparative workspace splitter */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

                                      {/* Missing person details reported by family */}
                                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150 space-y-3">
                                        <div className="flex items-center gap-2">
                                          <img
                                            src={mp.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"}
                                            alt={mp.fullName}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-inner"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div>
                                            <h6 className="font-bold text-slate-900 leading-tight">{mp.fullName}</h6>
                                            <p className="text-[10px] text-slate-500">Edad: {mp.age} años | Género: {mp.gender}</p>
                                          </div>
                                        </div>

                                        <div className="space-y-1.5 text-[11px] text-slate-650">
                                          <p className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 inline text-slate-400" /> Visto en: <strong>{mp.placeOfDisappearance}</strong>
                                          </p>
                                          <p className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 inline text-slate-400" /> Extravío: {mp.dateOfDisappearance}
                                          </p>
                                          <p className="p-1.5 bg-white border rounded border-slate-200 text-[10px] italic">
                                            "<strong>Filiación reportada:</strong> {mp.distinctiveFeatures}"
                                          </p>
                                          <p className="text-[10px] text-slate-450">
                                            Contacto: {mp.contactName} ({mp.contactPhone})
                                          </p>
                                        </div>
                                      </div>

                                      {/* AI Matching Reasonings & Real-time confirmation desk */}
                                      <div className="space-y-3 flex flex-col justify-between">
                                        <div>
                                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-1">Fundamentos del Algoritmo</span>
                                          <ul className="space-y-1 list-disc pl-4 text-[11px] text-slate-700 leading-normal">
                                            {match.reasons.map((reason, idx) => (
                                              <li key={idx} className="italic">"{reason}"</li>
                                            ))}
                                          </ul>
                                        </div>

                                        {/* Validation action panel */}
                                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                                          {match.status === "Pending" ? (
                                              <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                                  Anotación Judicial / Notas de Homologación
                                                </label>
                                                <input
                                                  type="text"
                                                  placeholder="Ej: Se cotejó lunar y cicatriz. Coincidencia ratificada por familiar."
                                                  value={validationNotes[match.id] || ""}
                                                  onChange={(e) => setValidationNotes({
                                                    ...validationNotes,
                                                    [match.id]: e.target.value
                                                  })}
                                                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900"
                                                />

                                                <div className="flex gap-2 text-[10px]">
                                                  <button
                                                    onClick={() => handleValidateMatchSubmit(match.id, "Confirmed")}
                                                    className="flex-1 bg-green-700 hover:bg-green-750 text-white font-bold py-1.5 rounded-lg cursor-pointer transition uppercase"
                                                  >
                                                    ✓ Confirmar Identidad
                                                  </button>
                                                  <button
                                                    onClick={() => handleValidateMatchSubmit(match.id, "Rejected")}
                                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded-lg cursor-pointer transition border border-slate-250 uppercase"
                                                  >
                                                    ✗ Descartar Cruce
                                                  </button>
                                                </div>
                                              </div>
                                          ) : (
                                            <div className={`p-2.5 rounded-xl text-[11px] border ${match.status === 'Confirmed'
                                                ? "bg-green-50 border-green-200 text-green-800"
                                                : "bg-red-50 border-red-200 text-red-800"
                                              }`}>
                                              <p className="font-bold uppercase tracking-wider text-[10px]">
                                                {match.status === 'Confirmed' ? "✓ Caso Homologado - Identidad Verificada" : "✗ Incompatibilidad Decretada"}
                                              </p>
                                              <p className="mt-1 italic">"{match.validationNotes || "Copia certificada subida al servidor."}"</p>
                                              <p className="mt-1.5 text-[9px] font-mono text-slate-400">
                                                Validador: {match.validatedBy || "Fiscal Interviniente"} ({match.validationDate || "2026-06-02"})
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                      </div>

                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Slide-over Notifications panel (alerts drawer overlay) */}
      {showAlertsDrawer && (
        <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-slide-left">

          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-950">
            <div className="flex items-center gap-1.5">
              <Bell className="h-4 w-4 animate-pulse text-slate-300" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Bitácora de Alertas Activas</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleMarkAllRead}
                className="text-[9px] bg-slate-800 hover:bg-slate-700 text-white font-bold py-0.5 px-2 rounded cursor-pointer"
              >
                Visto Todos
              </button>
              <button
                onClick={() => setShowAlertsDrawer(false)}
                className="text-slate-400 hover:text-white text-xs bg-transparent cursor-pointer"
              >
                X
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
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${al.read
                      ? "bg-slate-50/50 border-slate-150 text-slate-450"
                      : "bg-white border-slate-250 text-slate-900 shadow-sm"
                    }`}
                >
                  <div>
                    <div className="flex justify-between items-start text-[8px] font-mono tracking-wider font-bold">
                      <span className={al.type === "match_alert" ? "text-amber-600" : "text-slate-500"}>
                        {al.type === "match_alert" ? "COINCIDENCIA RECIENTE" : "NOTIFICACIÓN CENTRAL"}
                      </span>
                      <span className="text-slate-400">
                        {new Date(al.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold mt-1 text-slate-900 leading-snug">{al.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{al.message}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 gap-2">
                    {al.nnId && (
                      <button
                        onClick={() => {
                          setExpandedNNId(al.nnId || null);
                          setShowAlertsDrawer(false);
                        }}
                        className="text-[9px] bg-slate-900 text-white font-bold py-1 px-2.5 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        Verificar en Ficha
                      </button>
                    )}
                    <button
                      onClick={() => handleDismissAlert(al.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-medium ml-auto cursor-pointer"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[9px] text-slate-450">
            Dispositivo de coordinación RedActiva. Todos los derechos reservados.
          </div>

        </div>
      )}

      {/* REGISTRATION MODAL FOR CITIZEN MISSING PERSON CAMPAIGNS */}
      {showMissingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">

            <div className="sticky top-0 bg-white p-4.5 border-b border-slate-150 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-slate-800" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Formulario Oficial de Búsqueda Ciudadana
                </h3>
              </div>
              <button
                onClick={() => setShowMissingModal(false)}
                className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg border border-slate-250 text-slate-500 cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterMissing} className="p-6 space-y-4 text-xs">

              {mpFormError && (
                <div className="bg-red-50 text-red-800 p-2 text-xs rounded-lg border border-red-100">
                  {mpFormError}
                </div>
              )}

              {mpFormSuccess && (
                <div className="bg-green-50 text-green-800 p-2 text-xs rounded-lg border border-green-100 font-medium">
                  {mpFormSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-bold text-slate-600 mb-0.5">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Ej: Carlos Roberto Gómez"
                  value={mpFullName}
                  onChange={(e) => setMpFullName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Edad Exacta *</label>
                  <input
                    type="number"
                    placeholder="Ej: 45"
                    value={mpAge}
                    onChange={(e) => setMpAge(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Género *</label>
                  <select
                    value={mpGender}
                    onChange={(e) => setMpGender(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Estatura aprox.</label>
                  <input
                    type="text"
                    placeholder="Ej: 1.78m"
                    value={mpHeight}
                    onChange={(e) => setMpHeight(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Peso aprox.</label>
                  <input
                    type="text"
                    placeholder="Ej: 82kg"
                    value={mpWeight}
                    onChange={(e) => setMpWeight(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Fecha Extravío *</label>
                  <input
                    type="date"
                    value={mpDate}
                    onChange={(e) => setMpDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-605 focus:focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Último Lugar Visto *</label>
                  <input
                    type="text"
                    placeholder="Ej: Barrio Belgrano, Buenos Aires"
                    value={mpPlace}
                    onChange={(e) => setMpPlace(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-600 mb-0.5">Cicatrices, Señas Singulares o Ropa *</label>
                <textarea
                  rows={2.5}
                  placeholder="Ej: Tatuaje de rosa azul en el hombro, cicatriz pequeña en la ceja derecha..."
                  value={mpFeatures}
                  onChange={(e) => setMpFeatures(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Familiar de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: Mariela Gómez (Hija)"
                    value={mpContactName}
                    onChange={(e) => setMpContactName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Teléfono Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: +54 11 5555-4321"
                    value={mpContactPhone}
                    onChange={(e) => setMpContactPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-600 mb-0.5">Foto URL (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: https://..."
                  value={mpPhotoUrl}
                  onChange={(e) => setMpPhotoUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-600 mb-0.5">Notas complementarias</label>
                <textarea
                  rows={1.5}
                  placeholder="Detalles sobre hábitos o medicaciones..."
                  value={mpNotes}
                  onChange={(e) => setMpNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Registrar Búsqueda y Activar Cotejo
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal Pericial */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-slate-200 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Title */}
            <div className="bg-[#991b1b] text-white p-4 flex items-center justify-between border-b border-red-950">
              <div className="flex items-center gap-2">
                <Camera className="h-4.5 w-4.5 text-white" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-red-200">
                  Detalle de Evidencia Coincidente
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="text-white hover:text-red-100 p-1 rounded-lg border border-red-800 bg-red-900/50 hover:bg-red-900 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Photo content with zoom */}
            <div className="aspect-square w-full bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
              <img
                src={lightboxPhoto.url}
                alt="Evidencia médica"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-between">
              {lightboxPhoto.uploadedAt && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(lightboxPhoto.uploadedAt).toLocaleString()}
                </span>
              )}
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer uppercase"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Universal Footer */}
      <footer className="bg-red-800 border-t border-red-900 text-slate-400 py-8 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-200">
            RedActiva — Sistema Federal de Detección y Vinculación de Personas Desaparecidas en Tiempo Real
          </p>
          <p className="text-[10px] text-slate-300 leading-normal max-w-xl mx-auto">
            Sistema Federal de Búsqueda y Vinculación de Personas. Cumple con leyes de hábeas corpus e integridad biométrica de personas vulnerables.
          </p>
        </div>
      </footer>
    </div>
  );
}
