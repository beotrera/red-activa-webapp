import { MissingPerson, NNAdmission, MatchResult, SystemAlert, RedActivaUser, NNGender, ConsciousnessLevel } from "../types";

export interface CreateNNAdmissionPayload {
  estimatedAge: number;
  gender: NNGender;
  height: string;
  weight: string;
  distinctiveFeatures: string;
  consciousnessLevel: ConsciousnessLevel;
  notes?: string;
  images?: File[];
}
import { store } from "../store";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export interface DashboardData {
  missingPersons: MissingPerson[];
  nnAdmissions: NNAdmission[];
  matches: MatchResult[];
  alerts: SystemAlert[];
}

function authHeaders(): HeadersInit {
  const token = store.getState().auth.user?.token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/api/data`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error fetching system state");
  return res.json();
}

export async function createMissingPerson(data: Partial<MissingPerson>): Promise<MissingPerson> {
  const res = await fetch(`${API_BASE}/api/missing-persons`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error registering missing person");
  return res.json();
}

function normalizeId(obj: any): any {
  if (obj && obj._id && !obj.id) obj.id = obj._id;
  return obj;
}

export async function fetchPersons(params?: {
  status?: string;
  gender?: string;
}): Promise<NNAdmission[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/api/persons${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error fetching persons");
  const body = await res.json();
  const list: any[] = body.data ?? body;
  return list.map(normalizeId);
}

export async function createNNAdmission(data: CreateNNAdmissionPayload): Promise<NNAdmission> {
  const token = store.getState().auth.user?.token;
  const formData = new FormData();
  formData.append("estimatedAge", String(data.estimatedAge));
  formData.append("gender", data.gender);
  formData.append("height", data.height);
  formData.append("weight", data.weight);
  formData.append("distinctiveFeatures", data.distinctiveFeatures);
  formData.append("consciousnessLevel", data.consciousnessLevel);
  if (data.notes) formData.append("notes", data.notes);
  data.images?.forEach((file) => formData.append("images", file));

  const res = await fetch(`${API_BASE}/api/persons`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error("Error registering NN admission");
  const body = await res.json();
  return normalizeId(body.data ?? body);
}

export async function validateMatch(
  matchId: string,
  status: "Confirmed" | "Rejected",
  validatedBy: string,
  notes?: string
): Promise<{ success: boolean; match: MatchResult }> {
  const res = await fetch(`${API_BASE}/api/match/validate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ matchId, status, validatedBy, notes }),
  });
  if (!res.ok) throw new Error("Error validating match");
  return res.json();
}

export async function markAlertsAsRead(alertId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/alerts/read`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ alertId }),
  });
  if (!res.ok) throw new Error("Error marking alerts as read");
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<RedActivaUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || "Credenciales incorrectas");
  }
  const body = await res.json();
  // Unwrap envelope: { data: {...}, result: true, ... }
  return body.data ?? body;
}
