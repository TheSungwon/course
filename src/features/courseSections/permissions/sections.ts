import { UserRole, userRoles } from "@/drizzle/schema";

export function canCreateCourseSections({
  role,
}: {
  role?: UserRole | undefined;
}) {
  return role === userRoles[1];
}
export function canUpdateCourseSections({
  role,
}: {
  role?: UserRole | undefined;
}) {
  return role === userRoles[1];
}
export function canDeleteCourseSections({
  role,
}: {
  role?: UserRole | undefined;
}) {
  return role === userRoles[1];
}
