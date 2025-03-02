import { UserRole, userRoles } from "@/drizzle/schema";

export function canCreateCourses({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}
export function canDeleteCourses({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}
