import {
  NNAdmission,
  RedActivaUser,
  Gender,
  ConsciousnessLevel,
  NNStatus,
  PersonSimilarity,
  NeighborhoodStat,
} from "../types";
import { store } from "../store";

// Base URL includes "/api" per contract (e.g. http://localhost:3001/api)
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
// Static assets (uploaded images) are served from the host root, not under /api
const STATIC_BASE = API_BASE.replace(/\/api\/?$/, "");

export function getImageUrl(
  path: string | undefined | null,
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${STATIC_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

function authHeaders(): HeadersInit {
  const token = store.getState().auth.user?.token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function authHeadersNoContentType(): HeadersInit {
  const token = store.getState().auth.user?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Unwraps the API envelope and throws a user-facing message on failure.
 * Tolerant of both envelope shapes seen across the API:
 *  - { result, data, message, showMessage, needUpdate }  (most endpoints)
 *  - { success, data, errorCode, substitutions }          (persons/:id/audio)
 */
async function unwrap<T>(res: Response): Promise<T> {
  const body: any = await res.json().catch(() => ({}));
  const ok = body.result ?? body.success;
  if (!res.ok || ok === false) {
    throw new Error(
      body.showMessage?.ES || body.message || "Ocurrió un error inesperado",
    );
  }
  return body.data as T;
}

function normalizeId<T extends { _id?: string; id?: string }>(obj: T): T {
  if (obj && obj._id && !obj.id) (obj as any).id = obj._id;
  return obj;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string,
): Promise<RedActivaUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return unwrap<RedActivaUser>(res);
}

export async function logoutUser(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: authHeaders(),
  });
  await unwrap<{ message: string }>(res);
}

// ─── Persons (NN) ───────────────────────────────────────────────────────────────

export interface CreateNNAdmissionPayload {
  estimatedAgeMin: number;
  estimatedAgeMax: number;
  gender: Gender;
  height?: number;
  weight?: number;
  distinctiveFeatures: string;
  consciousnessLevel: ConsciousnessLevel;
  images?: File[];
}

export interface UpdateNNAdmissionPayload {
  estimatedAgeMin?: number;
  estimatedAgeMax?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  distinctiveFeatures?: string;
  consciousnessLevel?: ConsciousnessLevel;
  status?: NNStatus;
  assignedTo?: string;
}

export async function fetchPersons(params?: {
  status?: NNStatus;
  gender?: Gender;
  institution?: string;
}): Promise<NNAdmission[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/persons${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
  const list = await unwrap<NNAdmission[]>(res);
  return (list ?? []).map(normalizeId);
}

export async function fetchPersonById(id: string): Promise<NNAdmission> {
  const res = await fetch(`${API_BASE}/persons/${id}`, {
    headers: authHeaders(),
  });
  return normalizeId(await unwrap<NNAdmission>(res));
}

export async function fetchPersonSimilarities(
  id: string,
): Promise<PersonSimilarity[]> {
  const res = await fetch(`${API_BASE}/persons/${id}/similarities`, {
    headers: authHeaders(),
  });
  const list = await unwrap<PersonSimilarity[]>(res);
  return list ?? [];
}

export async function createNNAdmission(
  data: CreateNNAdmissionPayload,
): Promise<NNAdmission> {
  const formData = new FormData();
  formData.append("estimatedAgeMin", String(data.estimatedAgeMin));
  formData.append("estimatedAgeMax", String(data.estimatedAgeMax));
  formData.append("gender", data.gender);
  if (data.height != null) formData.append("height", String(data.height));
  if (data.weight != null) formData.append("weight", String(data.weight));
  formData.append("distinctiveFeatures", data.distinctiveFeatures);
  formData.append("consciousnessLevel", data.consciousnessLevel);
  data.images?.forEach((file) => formData.append("images", file));

  const res = await fetch(`${API_BASE}/persons`, {
    method: "POST",
    headers: authHeadersNoContentType(),
    body: formData,
  });
  return normalizeId(await unwrap<NNAdmission>(res));
}

export async function updatePerson(
  id: string,
  data: UpdateNNAdmissionPayload,
): Promise<NNAdmission> {
  const res = await fetch(`${API_BASE}/persons/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return normalizeId(await unwrap<NNAdmission>(res));
}

// ─── Person audio (one attachment per person) ──────────────────────────────────

/** Uploads/replaces the single audio attachment for an existing person. */
export async function uploadPersonAudio(personId: string, audio: File): Promise<NNAdmission> {
  const formData = new FormData();
  formData.append("audio", audio);

  const res = await fetch(`${API_BASE}/persons/${personId}/audio`, {
    method: "POST",
    headers: authHeadersNoContentType(),
    body: formData,
  });
  return normalizeId(await unwrap<NNAdmission>(res));
}

export interface PersonAudioBlob {
  blob: Blob;
  mimeType: string;
}

/**
 * GET /persons/:id/audio returns the raw audio bytes (not JSON) on success — Content-Type
 * is the original mimeType. On error it returns a normal WSresponse JSON body instead.
 * Returns null when the person has no audio attached (errorCode 5001) or doesn't exist (5000).
 */
export async function fetchPersonAudioBlob(personId: string): Promise<PersonAudioBlob | null> {
  const token = store.getState().auth.user?.token;
  const res = await fetch(`${API_BASE}/persons/${personId}/audio`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (body.errorCode === 5001 || body.errorCode === 5000) return null;
    throw new Error(body.showMessage?.ES || body.message || "No se pudo obtener el audio");
  }

  const blob = await res.blob();
  return { blob, mimeType: res.headers.get("Content-Type") ?? blob.type };
}

// ─── Analytics ───────────────────────────────────────────────────────────────────

export async function fetchNeighborhoodStats(): Promise<NeighborhoodStat[]> {
  const res = await fetch(`${API_BASE}/analytics/by-neighborhood`, {
    headers: authHeaders(),
  });
  const list = await unwrap<NeighborhoodStat[]>(res);
  return list ?? [];
}
