import { UserRole, userRoles } from "@/drizzle/schema";

export function canCreateProducts({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}
export function canUpdateProducts({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}
export function canDeleteProducts({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}
