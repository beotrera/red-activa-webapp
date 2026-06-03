import { MissingPerson, NNAdmission, MatchResult, SystemAlert, RedActivaUser } from "../types";

export interface DashboardData {
  missingPersons: MissingPerson[];
  nnAdmissions: NNAdmission[];
  matches: MatchResult[];
  alerts: SystemAlert[];
  geminiStatus: "connected" | "demo_simulated";
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch("/api/data");
  if (!res.ok) throw new Error("Error fetching system state");
  return res.json();
}

export async function createMissingPerson(data: Partial<MissingPerson>): Promise<MissingPerson> {
  const res = await fetch("/api/missing-persons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error registering missing person");
  return res.json();
}

export async function createNNAdmission(data: Partial<NNAdmission>): Promise<NNAdmission> {
  const res = await fetch("/api/nn-admissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error registering NN admission");
  return res.json();
}

export async function validateMatch(matchId: string, status: 'Confirmed' | 'Rejected', validatedBy: string, notes?: string): Promise<{ success: boolean; match: MatchResult }> {
  const res = await fetch("/api/match/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId, status, validatedBy, notes }),
  });
  if (!res.ok) throw new Error("Error validating match");
  return res.json();
}

export async function markAlertsAsRead(alertId: string): Promise<{ success: boolean }> {
  const res = await fetch("/api/alerts/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alertId }),
  });
  if (!res.ok) throw new Error("Error marking alerts as read");
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<RedActivaUser> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Credenciales incorrectas");
  }
  return res.json();
}

