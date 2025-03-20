import { LessonTable, UserRole, userRoles } from "@/drizzle/schema";
import { eq, or } from "drizzle-orm";

export function canCreateLessons({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}
export function canUpdateLessons({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}
export function canDeleteLessons({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}

export const wherePublicLessons = or(
  eq(LessonTable.status, "public"),
  eq(LessonTable.status, "preview")
);
