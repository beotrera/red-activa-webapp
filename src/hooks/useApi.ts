import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDashboardData,
  fetchPersons,
  createMissingPerson,
  createNNAdmission,
  updatePerson,
  validateMatch,
  markAlertsAsRead,
  loginUser,
  CreateNNAdmissionPayload,
} from "../utils/api";
import type { NNAdmission } from "../types";
import type { MissingPerson } from "../types";

export const DASHBOARD_KEY = ["dashboard"] as const;
export const PERSONS_KEY = ["persons"] as const;

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: fetchDashboardData,
    refetchInterval: 6000,
    staleTime: 0,
    enabled,
  });
}

export function usePersons(enabled = true) {
  return useQuery({
    queryKey: PERSONS_KEY,
    queryFn: () => fetchPersons(),
    refetchInterval: 6000,
    staleTime: 0,
    enabled,
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NNAdmission> }) =>
      updatePerson(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PERSONS_KEY }),
  });
}

export function useCreateNNAdmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNNAdmissionPayload) => createNNAdmission(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PERSONS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

export function useCreateMissingPerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MissingPerson>) => createMissingPerson(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DASHBOARD_KEY }),
  });
}

export function useValidateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      matchId,
      status,
      validatedBy,
      notes,
    }: {
      matchId: string;
      status: "Confirmed" | "Rejected";
      validatedBy: string;
      notes?: string;
    }) => validateMatch(matchId, status, validatedBy, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: DASHBOARD_KEY }),
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => markAlertsAsRead(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: DASHBOARD_KEY }),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
  });
}
