import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { MissingPerson, NNAdmission, MatchResult, SystemAlert } from "./src/types";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Database pre-seeded with highly descriptive Spanish-language cases
let missingPersons: MissingPerson[] = [
  {
    id: "mp-1",
    fullName: "Carlos Roberto Gómez",
    age: 45,
    gender: "Masculino",
    height: "1.78m",
    weight: "82kg",
    distinctiveFeatures: "Tatuaje de flor azul (rosa) en el hombro izquierdo. Cicatriz pequeña en la ceja derecha y suele vestir con gorra negra. Desapareció con campera deportiva oscura.",
    dateOfDisappearance: "2026-05-30",
    placeOfDisappearance: "Barrio Belgrano, Buenos Aires",
    contactName: "Mariela Gómez (Hija)",
    contactPhone: "+54 11 5555-4321",
    status: "Searching",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    notes: "Tiene problemas leves de desorientación temporal debido a un cuadro clínico."
  },
  {
    id: "mp-2",
    fullName: "Sofía Inés Martínez",
    age: 23,
    gender: "Femenino",
    height: "1.62m",
    weight: "54kg",
    distinctiveFeatures: "Cicatriz en forma de pequeño corazón o marca redondeada cerca de la muñeca derecha. Cabello castaño largo. Usaba buzo negro con capucha y jean azulgastado.",
    dateOfDisappearance: "2026-05-31",
    placeOfDisappearance: "Palermo Soho, Buenos Aires",
    contactName: "Roberto Martínez (Padre)",
    contactPhone: "+54 11 5555-9876",
    status: "Searching",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    notes: "Salió a caminar por la noche y no regresó a su domicilio."
  },
  {
    id: "mp-3",
    fullName: "Jorge Eduardo Rossi",
    age: 68,
    gender: "Masculino",
    height: "1.70m",
    weight: "75kg",
    distinctiveFeatures: "Calvicie avanzada en la parte superior, bigote canoso. Lleva una alianza de oro con inscripción grabada. Desapareció usando un abrigo impermeable verde oliva.",
    dateOfDisappearance: "2026-06-01",
    placeOfDisappearance: "Plaza Flores, Buenos Aires",
    contactName: "Alicia Rossi (Esposa)",
    contactPhone: "+54 11 4444-1212",
    status: "Searching",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    notes: "Sufre de Alzheimer leve. Puede responder al nombre de 'Coco'."
  }
];

let nnAdmissions: NNAdmission[] = [
  {
    id: "nn-1",
    estimatedAge: 43,
    gender: "Masculino",
    height: "1.80m",
    weight: "80kg",
    distinctiveFeatures: "Ingresó desorientado. Tiene un dibujo de rosa azulada o flor oscura en la extremidad superior izquierda. Lleva gorra negra en sus pertenencias y viste pantalón gris jogging con campera negra.",
    consciousnessLevel: "Desorientado",
    location: "Hospital General de Agudos Dr. Cosme Argerich",
    dateOfAdmission: "2026-06-01 02:30",
    status: "Potential Match",
    reportedBy: "Guardia Médica - Dr. Luis Soria",
    assignedTo: "Equipo Argentino de Antropología Forense (EAAF)",
    notes: "No recuerda su nombre completo ni su domicilio, refiere llamarse Carlos.",
    identifyingPhotos: [
      {
        url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=450&h=450&fit=crop",
        description: "Detalle de tatuaje: Ilustración estilo botánico de flor (rosa negra con matices oscuros y sombreado) en miembro superior izquierdo."
      }
    ]
  },
  {
    id: "nn-2",
    estimatedAge: 22,
    gender: "Femenino",
    height: "1.60m",
    weight: "52kg",
    distinctiveFeatures: "Paciente traída por personal policial. Inconsciente tras desvanecimiento en vía pública. Presenta una marca o marca de sutura antigua en la muñeca derecha. Viste un buzo tipo abrigo color negro de algodón y pantalones denim oscuros.",
    consciousnessLevel: "Inconsciente",
    location: "Hospital de Clínicas José de San Martín",
    dateOfAdmission: "2026-06-01 21:15",
    status: "Potential Match",
    reportedBy: "Servicio de Emergencias - Dra. Ana Falco",
    assignedTo: "Fiscalía de Distrito de la Boca",
    notes: "Se encuentra estable metabólicamente pero bajo observación neurológica.",
    identifyingPhotos: [
      {
        url: "https://images.unsplash.com/photo-1516062423079-7ca13cca775d?w=450&h=450&fit=crop",
        description: "Detalle macro de piel: Cicatriz redondeada blanquecina antigua cerca de flexión carpiana derecha."
      }
    ]
  },
  {
    id: "nn-3",
    estimatedAge: 35,
    gender: "Masculino",
    height: "1.72m",
    weight: "70kg",
    distinctiveFeatures: "Varón ingresado por la policía federal tras ser encontrado perdido en autopista. Cabello negro corto, barba tupida, cicatriz en la mejilla izquierda. Camisa azul a cuadros.",
    consciousnessLevel: "Consciente",
    location: "Comisaría Vecinal 14B",
    dateOfAdmission: "2026-06-02 08:00",
    status: "Unidentified",
    reportedBy: "Subcomisario Héctor Cardozo",
    assignedTo: "Policía Federal Argentina - División Búsqueda de Personas",
    notes: "Habla con dificultad, muy tímido o paranoico. No aporta datos filiatorios.",
    identifyingPhotos: []
  }
];

let matches: MatchResult[] = [
  {
    id: "match-1",
    nnId: "nn-1",
    missingPersonId: "mp-1",
    confidence: 94,
    reasons: [
      "Ambos describen un tatuaje de rosa/flor azul en el hombro/extremidad superior izquierda.",
      "La edad estimada (43) coincide estrechamente con la del reporte de desaparición (45).",
      "La vestimenta (pantalón gris jogging, campera oscura, gorra negra) coincide con la reportada.",
      "El paciente de la guardia responde al nombre de Carlos y presenta desorientación."
    ],
    status: "Pending"
  },
  {
    id: "match-2",
    nnId: "nn-2",
    missingPersonId: "mp-2",
    confidence: 88,
    reasons: [
      "Presenta la cicatriz o marca de sutura en la muñeca derecha que describe el reporte de Sofía.",
      "Rango de edad (22 aprox) e indumentaria (buzo negro, jeans azul gastado/denim oscuro) son altamente consistentes.",
      "Género y características de contextura física (1.60m, 52-54kg) son proporcionales.",
      "La zona de ingreso (Hospital Clínicas) es aledaña a Palermo Soho de donde desapareció."
    ],
    status: "Pending"
  }
];

let alerts: SystemAlert[] = [
  {
    id: "alert-1",
    type: "match_alert",
    title: "Coincidencia Crítica Detectada - 94%",
    message: "Paciente ingresado en el Hosp. Argerich coincide semánticamente con Carlos Roberto Gómez.",
    timestamp: "2026-06-01T03:00:00Z",
    matchId: "match-1",
    nnId: "nn-1",
    missingPersonId: "mp-1",
    read: false
  },
  {
    id: "alert-2",
    type: "match_alert",
    title: "Nueva Coincidencia de Alta Probabilidad - 88%",
    message: "Paciente femenina ingresada en Hosp. de Clínicas coincide con reporte de Sofía Inés Martínez.",
    timestamp: "2026-06-01T21:45:00Z",
    matchId: "match-2",
    nnId: "nn-2",
    missingPersonId: "mp-2",
    read: false
  }
];

// Initialize GoogleGenAI client lazily or if key exists
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        genAI = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Gemini SDK successfully initialized.");
      } catch (err) {
        console.error("Failed to initialize Gemini Client:", err);
      }
    }
  }
  return genAI;
}

// Simulated local rule-based matcher for fallback and quick demo fidelity
function computeLocalMatches() {
  const activeNNs = nnAdmissions.filter(n => n.status !== "Identified");
  const activeMPs = missingPersons.filter(m => m.status === "Searching");

  activeNNs.forEach(nn => {
    activeMPs.forEach(mp => {
      // Avoid duplicating matches
      const exists = matches.some(m => m.nnId === nn.id && m.missingPersonId === mp.id);
      if (exists) return;

      let score = 0;
      const reasons: string[] = [];

      // Simple gender match
      if (nn.gender === mp.gender || nn.gender === "Desconocido") {
        score += 15;
      } else {
        return; // Mismatched genders are skipped
      }

      // Age closeness
      const ageDiff = Math.abs(nn.estimatedAge - mp.age);
      if (ageDiff <= 3) {
        score += 25;
        reasons.push(`El rango de edad tiene coincidencia estrecha (diferencia de ${ageDiff} años).`);
      } else if (ageDiff <= 7) {
        score += 15;
        reasons.push(`El rango de edad aproximado es compatible (diferencia de ${ageDiff} años).`);
      }

      // Keyword scanning on distinctive features (Spanish keywords)
      const nnFeatures = nn.distinctiveFeatures.toLowerCase();
      const mpFeatures = mp.distinctiveFeatures.toLowerCase();

      // Check tattoo keywords
      if (
        (nnFeatures.includes("tatuaje") || nnFeatures.includes("dibujo") || nnFeatures.includes("marca")) &&
        (mpFeatures.includes("tatuaje") || mpFeatures.includes("marca"))
      ) {
        // More specific check
        if (
          (nnFeatures.includes("rosa") || nnFeatures.includes("flor") || nnFeatures.includes("azul")) &&
          (mpFeatures.includes("rosa") || mpFeatures.includes("flor") || mpFeatures.includes("azul"))
        ) {
          score += 45;
          reasons.push("Ambos describen un tatuaje o marca con formas o colores homólogos en una de sus extremidades.");
        } else {
          score += 15;
          reasons.push("Ambos mencionan la existencia de marcas corporales singulares.");
        }
      }

      // Check wrist/scar keywords
      if (
        (nnFeatures.includes("muñeca") || nnFeatures.includes("sutura") || nnFeatures.includes("cicatriz")) &&
        (mpFeatures.includes("muñeca") || mpFeatures.includes("sutura") || mpFeatures.includes("cicatriz"))
      ) {
        score += 25;
        reasons.push("Ambos reportes detallan una cicatriz o marca de sutura antigua en la muñeca.");
      }

      // Clothing checking
      if (
        (nnFeatures.includes("buzo") && mpFeatures.includes("buzo")) ||
        (nnFeatures.includes("negraa") || nnFeatures.includes("negro") && mpFeatures.includes("negro")) ||
        (nnFeatures.includes("jogging") && mpFeatures.includes("campera"))
      ) {
        score += 10;
        reasons.push("La indumentaria o colores descritos son congruentes.");
      }

      if (score >= 40) {
        // Cap score at 95 for local match
        const finalScore = Math.min(score, 95);
        const newMatch: MatchResult = {
          id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nnId: nn.id,
          missingPersonId: mp.id,
          confidence: finalScore,
          reasons: reasons.length > 0 ? reasons : ["Coincidencia biométrica y morfológica general."],
          status: "Pending"
        };
        matches.push(newMatch);

        // Add System Alert
        alerts.unshift({
          id: `alert-${Date.now()}`,
          type: "match_alert",
          title: `Coincidencia Detectada - ${finalScore}%`,
          message: `Posible coincidencia entre NN (${nn.location}) y ${mp.fullName}.`,
          timestamp: new Date().toISOString(),
          matchId: newMatch.id,
          nnId: nn.id,
          missingPersonId: mp.id,
          read: false
        });

        nn.status = "Potential Match";
      }
    });
  });
}

// Intelligent Gemini Matcher
async function runGeminiMatching(): Promise<boolean> {
  const client = getGeminiClient();
  if (!client) {
    console.log("Skipping Gemini match: Native client is not set up.");
    return false;
  }

  const activeNNs = nnAdmissions.filter(n => n.status !== "Identified");
  const activeMPs = missingPersons.filter(m => m.status === "Searching");

  if (activeNNs.length === 0 || activeMPs.length === 0) return true;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analiza las dos listas de personas ingresadas y reportes de búsquedas en tiempo real.
Devuelve posibles cruces semánticos donde la probabilidad de coincidencia sea mayor a 35%.

PACIENTES NN INGRESADOS:
${JSON.stringify(activeNNs.map(n => ({ id: n.id, estimatedAge: n.estimatedAge, gender: n.gender, features: n.distinctiveFeatures, details: n.notes })), null, 2)}

PERSONAS DESAPARECIDAS REPORTADAS:
${JSON.stringify(activeMPs.map(m => ({ id: m.id, fullName: m.fullName, age: m.age, gender: m.gender, features: m.distinctiveFeatures, details: m.notes })), null, 2)}

RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO en el siguiente esquema, sin textos extra, sin marcadores de formato adicionales fuera del markdown de JSON.
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coincidencias: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nnId: { type: Type.STRING },
                  missingPersonId: { type: Type.STRING },
                  confidence: { type: Type.INTEGER, description: "Número entre 1 y 100" },
                  reasons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Lista de razones en español fundamentadas en características físicas coincidente"
                  }
                },
                required: ["nnId", "missingPersonId", "confidence", "reasons"]
              }
            }
          },
          required: ["coincidencias"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      console.error("Empty response from Gemini matcher.");
      return false;
    }

    const result = JSON.parse(text.trim());
    const aiCoincidencias = result.coincidencias || [];

    aiCoincidencias.forEach((aiMatch: any) => {
      // Ensure the IDs actually exist
      const nnExists = nnAdmissions.some(n => n.id === aiMatch.nnId);
      const mpExists = missingPersons.some(m => m.id === aiMatch.missingPersonId);

      if (!nnExists || !mpExists) return;

      // Upsert or insert match
      const existingIndex = matches.findIndex(m => m.nnId === aiMatch.nnId && m.missingPersonId === aiMatch.missingPersonId);
      if (existingIndex !== -1) {
        // Update reasons and confidence
        matches[existingIndex].confidence = aiMatch.confidence;
        matches[existingIndex].reasons = aiMatch.reasons;
      } else {
        const newMatch: MatchResult = {
          id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nnId: aiMatch.nnId,
          missingPersonId: aiMatch.missingPersonId,
          confidence: aiMatch.confidence,
          reasons: aiMatch.reasons,
          status: "Pending"
        };
        matches.push(newMatch);

        // Update NN Status if confidence is high
        const nn = nnAdmissions.find(n => n.id === aiMatch.nnId);
        if (nn && aiMatch.confidence > 50) {
          nn.status = "Potential Match";
        }

        // Trigger System Alert
        alerts.unshift({
          id: `alert-${Date.now()}`,
          type: "match_alert",
          title: `Coincidencia AI de ${aiMatch.confidence}%`,
          message: `El motor neuronal detectó correspondencia entre NN (${nn?.location || "desconocido"}) y ${missingPersons.find(m => m.id === aiMatch.missingPersonId)?.fullName}.`,
          timestamp: new Date().toISOString(),
          matchId: newMatch.id,
          nnId: aiMatch.nnId,
          missingPersonId: aiMatch.missingPersonId,
          read: false
        });
      }
    });

    return true;
  } catch (err) {
    console.error("Gemini Matcher failed unexpectedly:", err);
    return false;
  }
}

// Central API endpoints
app.get("/api/data", (req, res) => {
  res.json({
    missingPersons,
    nnAdmissions,
    matches,
    alerts,
    geminiStatus: getGeminiClient() ? "connected" : "demo_simulated"
  });
});

app.get("/api/missing-persons", (req, res) => {
  res.json(missingPersons);
});

app.post("/api/missing-persons", async (req, res) => {
  const {
    fullName,
    age,
    gender,
    height,
    weight,
    distinctiveFeatures,
    dateOfDisappearance,
    placeOfDisappearance,
    contactName,
    contactPhone,
    notes,
    photoUrl
  } = req.body;

  if (!fullName || !age || !gender || !distinctiveFeatures || !dateOfDisappearance || !placeOfDisappearance) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const newPerson: MissingPerson = {
    id: `mp-${Date.now()}`,
    fullName,
    age: Number(age),
    gender,
    height: height || "No especificada",
    weight: weight || "No especificado",
    distinctiveFeatures,
    dateOfDisappearance,
    placeOfDisappearance,
    contactName: contactName || "Anónimo / RedActiva",
    contactPhone: contactPhone || "N/A",
    status: "Searching",
    photoUrl: photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face`,
    notes
  };

  missingPersons.unshift(newPerson);

  // Trigger match checks
  const runReal = await runGeminiMatching();
  if (!runReal) {
    computeLocalMatches();
  }

  res.status(201).json(newPerson);
});

app.get("/api/nn-admissions", (req, res) => {
  res.json(nnAdmissions);
});

app.post("/api/nn-admissions", async (req, res) => {
  const {
    estimatedAge,
    gender,
    height,
    weight,
    distinctiveFeatures,
    consciousnessLevel,
    location,
    dateOfAdmission,
    reportedBy,
    assignedTo,
    notes,
    identifyingPhotos
  } = req.body;

  if (!estimatedAge || !gender || !distinctiveFeatures || !consciousnessLevel || !location) {
    return res.status(400).json({ error: "Faltan campos y especificaciones obligatorias" });
  }

  const newNN: NNAdmission = {
    id: `nn-${Date.now()}`,
    estimatedAge: Number(estimatedAge),
    gender,
    height: height || "No especificada",
    weight: weight || "No especificado",
    distinctiveFeatures,
    consciousnessLevel,
    location,
    dateOfAdmission: dateOfAdmission || new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: "Unidentified",
    reportedBy: reportedBy || "Guardia Auxiliar Portal",
    assignedTo: assignedTo || "Equipo Argentino de Antropología Forense (EAAF)",
    notes,
    identifyingPhotos: identifyingPhotos || []
  };

  nnAdmissions.unshift(newNN);

  // Trigger matching
  const runReal = await runGeminiMatching();
  if (!runReal) {
    computeLocalMatches();
  }

  res.status(201).json(newNN);
});

app.post("/api/match/validate", (req, res) => {
  const { matchId, status, validatedBy, notes } = req.body;

  if (!matchId || !status) {
    return res.status(400).json({ error: "Falta id de coincidencia o estado de verificación" });
  }

  const match = matches.find(m => m.id === matchId);
  if (!match) {
    return res.status(404).json({ error: "No se encontró el emparejamiento especificado" });
  }

  match.status = status;
  match.validatedBy = validatedBy || "Agente Fiscalía de Serv.";
  match.validationDate = new Date().toISOString().split('T')[0];
  match.validationNotes = notes;

  if (status === "Confirmed") {
    // Mark both as fully resolved / found!
    const nn = nnAdmissions.find(n => n.id === match.nnId);
    if (nn) nn.status = "Identified";

    const mp = missingPersons.find(m => m.id === match.missingPersonId);
    if (mp) mp.status = "Resolved";

    // Set other matches of this NN or of this missing person as Rejected
    matches.forEach(m => {
      if (m.id !== matchId && (m.nnId === match.nnId || m.missingPersonId === match.missingPersonId)) {
        m.status = "Rejected";
      }
    });

    // Create global notification
    alerts.unshift({
      id: `alert-${Date.now()}`,
      type: "system",
      title: "VINCULACIÓN CONFIRMADA 🎉",
      message: `El Ministerio Público fiscal validó exitosamente la identidad de ${mp?.fullName} ingresado en ${nn?.location}.`,
      timestamp: new Date().toISOString(),
      matchId: match.id,
      nnId: match.nnId,
      missingPersonId: match.missingPersonId,
      read: false
    });
  }

  res.json({ success: true, match });
});

app.post("/api/alerts/read", (req, res) => {
  const { alertId } = req.body;
  if (alertId === "all") {
    alerts.forEach(a => a.read = true);
  } else {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) alert.read = true;
  }
  res.json({ success: true });
});

// Pre-seeded users representing federal agents, clinicians, investigators, and forensicians
const seededUsers = [
  {
    id: "user-1",
    email: "eaaf@redactiva.gob.ar",
    password: "eaaf",
    fullName: "Lic. Clara Pellegrini",
    role: "Forense",
    entity: "Equipo Argentino de Antropología Forense (EAAF)",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "user-2",
    email: "clinicas@redactiva.gob.ar",
    password: "clinicas",
    fullName: "Dra. Ana Falco",
    role: "Médico",
    entity: "Hospital de Clínicas (Servicio de Trabajo Social)",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "user-3",
    email: "policia@redactiva.gob.ar",
    password: "policia",
    fullName: "Subcomisario Héctor Cardozo",
    role: "Seguridad",
    entity: "Policía Federal Argentina - División Búsqueda de Personas",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "user-4",
    email: "juzgado@redactiva.gob.ar",
    password: "juzgado",
    fullName: "Dra. Silvina Gatti",
    role: "Judicial",
    entity: "Juzgado Nacional en lo Criminal y Correccional Nº 4",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  }
];

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Por favor ingrese email y contraseña" });
  }

  const user = seededUsers.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Credenciales de agente incorrectas o inválidas" });
  }

  // Generate a mock JWT-style token
  const token = `redactiva-tok-${user.id}-${Date.now().toString(36)}`;
  
  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    entity: user.entity,
    avatarUrl: user.avatarUrl,
    token
  });
});


// Run an initial local match on seeding to ensure ready demo matches immediately
computeLocalMatches();

async function startServer() {
  // Vite middleware for development or full static server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RedActiva App Ready] Running on port http://localhost:${PORT}`);
  });
}

startServer();
