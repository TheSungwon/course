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
import { getUserCourseAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache";
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await getCourses();
  // console.log(courses, "----------getCourses()---------");
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
  cacheTag(
    getCourseGlobalTag(),
    getUserCourseAccessGlobalTag(),
    getCourseSectionGlobalTag(),
    getLessonGlobalTag()
  );
  //   첫 번째 줄의 "use cache";는 JavaScript의 "use strict";와 유사한 방식으로 사용되는 지시문입니다. 이 지시문은 캐싱 메커니즘을 활성화하는 역할을 합니다. 이는 컴파일러나 런타임 환경에 특정한 최적화 또는 동작을 지시할 수 있습니다.
  // cacheTag 함수는 네 개의 글로벌 태그를 인수로 받아들입니다. 이 태그들은 각각 getCourseGlobalTag(), getUserCourseAccessGlobalTag(), getCourseSectionGlobalTag(), getLessonGlobalTag() 함수 호출을 통해 생성됩니다. 각 함수는 getGlobalTag라는 공통 함수를 호출하여 특정 문자열을 기반으로 태그를 생성합니다. 예를 들어, getCourseGlobalTag() 함수는 "courses" 문자열을 사용하여 글로벌 태그를 생성합니다.
  // 이러한 태그들은 캐싱 메커니즘을 통해 저장되며, 이는 애플리케이션의 성능을 향상시키고 불필요한 데이터 재요청을 방지하는 데 도움이 됩니다. 각 태그는 특정 데이터 집합을 나타내며, 이를 통해 데이터 접근 및 관리가 보다 효율적으로 이루어질 수 있습니다.

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
