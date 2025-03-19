import { ProductTable, UserRole, userRoles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export function canCreateProducts({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}
export function canUpdateProducts({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}
export function canDeleteProducts({ role }: { role?: UserRole | undefined }) {
  return role === userRoles[1];
}

export const wherePublicProducts = eq(ProductTable.status, "public");
