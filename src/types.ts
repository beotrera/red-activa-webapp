export enum UserRole {
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  ADMINISTRATOR = 'ADMINISTRATOR',
  SOCIAL_WORKER = 'SOCIAL_WORKER',
  PSYCHOLOGIST = 'PSYCHOLOGIST',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface RedActivaUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  gender?: Gender;
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

export enum NNGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum ConsciousnessLevel {
  CONSCIOUS = 'CONSCIOUS',
  DISORIENTED = 'DISORIENTED',
  UNCONSCIOUS = 'UNCONSCIOUS',
  SEDATED = 'SEDATED',
}

export enum NNStatus {
  UNIDENTIFIED = 'UNIDENTIFIED',
  POTENTIAL_MATCH = 'POTENTIAL_MATCH',
  IDENTIFIED = 'IDENTIFIED',
}

export interface IdentifyingPhoto {
  url: string;
  uploadedAt: string;
}

export interface NNAdmission {
  id: string;
  estimatedAge: number;
  gender: NNGender;
  height: string;
  weight: string;
  distinctiveFeatures: string;
  consciousnessLevel: ConsciousnessLevel;
  location: string;
  dateOfAdmission: string;
  status: NNStatus;
  reportedBy: string;
  assignedTo?: string;
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
