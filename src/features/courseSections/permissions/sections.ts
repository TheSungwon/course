import { CourseSectionTable, UserRole, userRoles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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

export const wherePublicCourseSections = eq(
  CourseSectionTable.status,
  "public"
);
