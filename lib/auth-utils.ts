import type { UserRole } from "./types";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  admin: 2,
  superadmin: 3,
};

export function hasMinRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}
