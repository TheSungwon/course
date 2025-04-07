import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { and, eq } from "drizzle-orm";

export async function canUpdateUserLessonCompleteStatus(
  user: { userId: string | undefined },
  lessonId: string
) {
  if (user.userId == null) return false;

  const [cousreAccess] = await db
    .select({
      courseId: CourseTable.id,
    })
    .from(UserCourseAccessTable)
    .innerJoin(CourseTable, eq(CourseTable.id, UserCourseAccessTable.courseId))

    .innerJoin(
      CourseSectionTable,

      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections
      )
    );
}
