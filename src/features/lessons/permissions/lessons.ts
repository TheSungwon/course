import { UserRole, userRoles } from "@/drizzle/schema";

export function canCreateLessons({
  role,
}: {
  role?: UserRole | undefined;
}) {
  return role === userRoles[1];
}
export function canUpdateLessons({
  role,
}: {
  role?: UserRole | undefined;
}) {
  return role === userRoles[1];
}
export function canDeleteLessons({
  role,
}: {
  role?: UserRole | undefined;
}) {
  return role === userRoles[1];
}
