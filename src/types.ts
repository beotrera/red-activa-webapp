export interface RedActivaUser {
  id: string;
  email: string;
  fullName: string;
  role: 'Forense' | 'Médico' | 'Seguridad' | 'Judicial' | 'Ciudadano';
  entity: string;
  avatarUrl?: string;
  token?: string;
}

export interface MissingPerson {
  id: string;
  fullName: string;
  age: number;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  height: string; // e.g. "1.75m"
  weight: string; // e.g. "75kg"
  distinctiveFeatures: string; // Tattoos, scars, mole, clothing at departure
  dateOfDisappearance: string; // YYYY-MM-DD
  placeOfDisappearance: string; // e.g. "Barrio Belgrano, Buenos Aires"
  contactName: string;
  contactPhone: string;
  status: 'Searching' | 'Found' | 'Resolved';
  photoUrl?: string;
  notes?: string;
}

export interface IdentifyingPhoto {
  url: string;
  description: string;
}

export interface NNAdmission {
  id: string;
  estimatedAge: number;
  gender: 'Masculino' | 'Femenino' | 'Otro' | 'Desconocido';
  height: string;
  weight: string;
  distinctiveFeatures: string; // Physical features found, scars, tattoos, clothing
  consciousnessLevel: 'Consciente' | 'Desorientado' | 'Inconsciente' | 'Sedado';
  location: string; // Hospital name or police station, e.g. "Hospital Central - Guardia"
  dateOfAdmission: string; // YYYY-MM-DD HH:mm
  status: 'Unidentified' | 'Potential Match' | 'Identified';
  reportedBy: string; // "Hospital General Pozos", "Morgue Judicial", etc.
  assignedTo?: string; // Designated agency, e.g. "EAAF", "Policía Federal", etc.
  notes?: string;
  identifyingPhotos?: IdentifyingPhoto[];
}

export interface MatchResult {
  id: string;
  nnId: string;
  missingPersonId: string;
  confidence: number; // 0 - 100
  reasons: string[];
  status: 'Pending' | 'Validating' | 'Confirmed' | 'Rejected';
  validatedBy?: string;
  validationDate?: string;
  validationNotes?: string;
}

export interface SystemAlert {
  id: string;
  type: 'match_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  matchId?: string;
  nnId?: string;
  missingPersonId?: string;
  read: boolean;
}
