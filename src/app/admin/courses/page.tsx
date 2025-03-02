import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  LessonTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { CourseTable as dbCourseTable } from "@/drizzle/schema";
import { CourseTable } from "@/features/courses/components/CourseTable";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await getCourses();
  console.log(courses, "----------getCourses()---------");
  return (
    <div className="container my-6">
      <PageHeader title="Courses">
        <Button asChild>
          <Link href="/admin/courses/new">New Courses</Link>
        </Button>
      </PageHeader>

      <CourseTable courses={courses} />
    </div>
  );
}

async function getCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  return db
    .select({
      id: dbCourseTable.id,
      name: dbCourseTable.name,
      description: dbCourseTable.description,
      sectionsCount: countDistinct(CourseSectionTable),
      lessonsCount: countDistinct(LessonTable),
      studentsCount: countDistinct(UserCourseAccessTable),
    })
    .from(dbCourseTable)
    .leftJoin(
      CourseSectionTable,
      eq(CourseSectionTable.courseId, dbCourseTable.id)
    )
    .leftJoin(LessonTable, eq(LessonTable.sectionId, CourseSectionTable.id))

    .leftJoin(
      UserCourseAccessTable,
      eq(UserCourseAccessTable.courseId, dbCourseTable.id)
    )
    .orderBy(asc(dbCourseTable.name))
    .groupBy(dbCourseTable.id);
}
