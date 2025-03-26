import { db } from "@/drizzle/db";
import { UserCourseAccessTable } from "@/drizzle/schema";
import { revalidateUserCourseAccessCache } from "./cache/userCourseAccess";

//({userId: user.id, courseIds});
export async function addUserCourseAccess({
  userId,
  courseIds,
}: {
  userId: string;
  courseIds: string[];
}) {
  const accesses = await db
    .insert(UserCourseAccessTable)
    .values(courseIds.map((courseId) => ({ userId, courseId })))
    .onConflictDoNothing()
    .returning();

  accesses.forEach(revalidateUserCourseAccessCache);

  return accesses;
}
