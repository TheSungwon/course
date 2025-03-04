import { CourseSectionTable } from "@/drizzle/schema";

export async function insertSection(
  courseId: string,
  data: typeof CourseSectionTable.$inferInsert
) {
  console.log(
    courseId,
    data,
    "insertSection ------------features/courseSections/db/sections"
  );
}
