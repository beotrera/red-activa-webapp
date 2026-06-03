import { Gender, UserRole, RedActivaUser } from "../types";

const PREFIX_MAP: Partial<Record<UserRole, { [G in Gender]?: string } & { default?: string }>> = {
  [UserRole.DOCTOR]: { [Gender.MALE]: "Dr.", [Gender.FEMALE]: "Dra." },
  [UserRole.NURSE]: { default: "Enf." },
  [UserRole.SOCIAL_WORKER]: { default: "Lic." },
  [UserRole.PSYCHOLOGIST]: { default: "Lic." },
  [UserRole.ADMINISTRATOR]: { default: "" },
};

export function getUserPrefix(user: Pick<RedActivaUser, "role" | "gender">): string {
  const entry = PREFIX_MAP[user.role];
  if (!entry) return "";
  if (user.gender && entry[user.gender] !== undefined) return entry[user.gender]!;
  return entry.default ?? "";
}

export function getDisplayName(user: Pick<RedActivaUser, "role" | "gender" | "fullName">): string {
  const prefix = getUserPrefix(user);
  return prefix ? `${prefix} ${user.fullName}` : user.fullName;
}
