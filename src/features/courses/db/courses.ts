import { db } from "@/drizzle/db";
import { CourseTable } from "@/drizzle/schema";
import { revalidateCourseCache } from "./cache/courses";
import { eq } from "drizzle-orm";

export async function insertCourse(data: typeof CourseTable.$inferSelect) {
  const [newCourse] = await db.insert(CourseTable).values(data).returning();

  if (newCourse == null) {
    throw new Error("Failed to create course.");
  }

  revalidateCourseCache(newCourse.id);

  return newCourse;
}

export async function updateCourseDB(
  id: string,
  data: typeof CourseTable.$inferSelect
) {
  const [updateCourse] = await db
    .update(CourseTable)
    .set(data)
    .where(eq(CourseTable.id, id))
    .returning();

  if (updateCourse == null) {
    throw new Error("Failed to update course.");
  }

  revalidateCourseCache(updateCourse.id);

  return updateCourse;
}

export async function deleteCourse(id: string) {
  const [deletedCourse] = await db
    .delete(CourseTable)
    .where(eq(CourseTable.id, id))
    .returning();

  if (deletedCourse == null) {
    throw new Error("Failed to delete course.");
  }

  console.log(
    deletedCourse,
    "delete course ------------features/courses/actions/courses"
  );
  revalidateCourseCache(deletedCourse.id);

  return deletedCourse;
}
