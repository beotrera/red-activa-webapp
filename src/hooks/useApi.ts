import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPersons,
  fetchPersonById,
  fetchPersonSimilarities,
  createNNAdmission,
  updatePerson,
  loginUser,
  logoutUser,
  CreateNNAdmissionPayload,
  UpdateNNAdmissionPayload,
} from "../utils/api";
import { NNStatus, Gender } from "../types";

export const PERSONS_KEY = ["persons"] as const;
export const personKey = (id: string) => ["persons", id] as const;
export const similaritiesKey = (id: string) => ["persons", id, "similarities"] as const;

export function usePersons(enabled = true, filters?: { status?: NNStatus; gender?: Gender }) {
  return useQuery({
    queryKey: filters ? [...PERSONS_KEY, filters] : PERSONS_KEY,
    queryFn: () => fetchPersons(filters),
    refetchInterval: 6000,
    staleTime: 0,
    enabled,
  });
}

export function usePerson(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: personKey(id ?? ""),
    queryFn: () => fetchPersonById(id as string),
    enabled: enabled && !!id,
    staleTime: 0,
  });
}

/**
 * Matching against citizen reports runs asynchronously in the backend after a person
 * is created — there's no websocket/push notification, so we poll this endpoint.
 */
export function useSimilarities(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: similaritiesKey(id ?? ""),
    queryFn: () => fetchPersonSimilarities(id as string),
    enabled: enabled && !!id,
    refetchInterval: 8000,
    staleTime: 0,
  });
}

export function useCreateNNAdmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNNAdmissionPayload) => createNNAdmission(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PERSONS_KEY }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNNAdmissionPayload }) =>
      updatePerson(id, data),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: PERSONS_KEY });
      qc.invalidateQueries({ queryKey: personKey(variables.id) });
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => logoutUser(),
  });
}
