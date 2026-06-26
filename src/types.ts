// ─── Shared enums (match backend contract exactly) ────────────────────────────

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

export enum InstitutionType {
  HOSPITAL = 'HOSPITAL',
  CLINIC = 'CLINIC',
  SANATORIUM = 'SANATORIUM',
  MANAGEMENT = 'MANAGEMENT',
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface RedActivaUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  gender?: Gender;
  entity: string; // institution name
  avatarUrl?: string;
  token?: string;
}

// ─── Institutions ──────────────────────────────────────────────────────────────

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Institution {
  _id: string;
  name: string;
  type: InstitutionType;
  address: string;
  phone?: string;
  neighborhood: string;
  location: GeoPoint;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Persons (NN) ───────────────────────────────────────────────────────────────

export interface IdentifyingPhoto {
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface PersonCreatedBy {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Frontend-facing shape of a Person/NN record, normalized (_id → id).
export interface NNAdmission {
  id: string;
  estimatedAgeMin: number;
  estimatedAgeMax: number;
  gender: Gender;
  height?: number;
  weight?: number;
  distinctiveFeatures: string;
  consciousnessLevel: ConsciousnessLevel;
  address: string;
  neighborhood: string;
  geoLocation?: GeoPoint;
  institution?: Institution | string;
  dateOfAdmission: string;
  status: NNStatus;
  reportedBy: string;
  assignedTo?: string;
  identifyingPhotos?: IdentifyingPhoto[];
  createdBy?: PersonCreatedBy | string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Reports (citizen missing-person reports — read only) ─────────────────────

export interface Report {
  _id: string;
  fullName: string;
  description: string;
  picture: string;
  neighborhood: string;
  lastSeenDate?: string;
  gender?: Gender;
  estimatedAge?: number;
  height?: number;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Similarities (AI matching results) ────────────────────────────────────────

export interface PersonSimilarity {
  _id: string;
  person: string;
  report: {
    _id: string;
    fullName: string;
    description: string;
    neighborhood: string;
    gender?: Gender;
    estimatedAge?: number;
    lastSeenDate?: string;
  };
  score: number; // 1-100
  differences: string[];
  reasoning: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export interface NeighborhoodStat {
  neighborhood: string;
  nn: number;
  reports: number;
  /** Centroid — [longitude, latitude], GeoJSON order */
  coordinates: [number, number] | null;
  /** Exterior ring of the neighborhood polygon — [longitude, latitude][], closed (first === last). */
  polygon: [number, number][] | null;
  comuna: number | null;
}

// ─── API envelope ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  result: boolean;
  data: T | null;
  errorCode: number | null;
  message: string | null;
  showMessage: { EN: string; ES: string } | null;
  needUpdate: boolean;
}
