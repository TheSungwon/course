import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateUserCache } from "./cache";

export async function insertUser(data: typeof UserTable.$inferInsert) {
  const [newUser] = await db
    .insert(UserTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [UserTable.id],
      set: data,
    });

  if (newUser == null) {
    throw new Error("Failed to insert user.");
  }

  revalidateUserCache(newUser.id);
  return newUser;
}

export async function updateUser(
  { clerkUserId }: { clerkUserId: string },
  data: Partial<typeof UserTable.$inferInsert>
) {
  const [updatedUser] = await db
    .update(UserTable)
    .set(data)
    .returning()
    .where(eq(UserTable.clerkUserId, clerkUserId));
  if (updatedUser == null) {
    throw new Error("Failed to update user.");
  }

  revalidateUserCache(updatedUser.id);
  return updatedUser;
}

export async function deleteUser({ clerkUserId }: { clerkUserId: string }) {
  const [deletedUser] = await db
    .update(UserTable)
    .set({
      deletedAt: new Date(),
      email: "redacted@deleted.com",
      name: "Deleted User",
      clerkUserId: "deleted",
      imageUrl: null,
    })
    .returning()
    .where(eq(UserTable.clerkUserId, clerkUserId));
  if (deletedUser == null) {
    throw new Error("Failed to delete user.");
  }

  revalidateUserCache(deletedUser.id);
  return deletedUser;
}
