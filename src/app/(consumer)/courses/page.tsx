import {
  SkeletonArray,
  SkeletonButton,
  SkeletonText,
} from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserCourseAccessTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getUserCourseAccessUserTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/userLessonComplete";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { getCurrentUser } from "@/services/clerk";
import { and, countDistinct, eq } from "drizzle-orm";
import { ArrowRightIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

export default function CoursesPage() {
  return (
    <div className="container my-6">
      <PageHeader title="내 강의" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <SkeletonArray amount={3}>
              <SkeletonCourseCard />
            </SkeletonArray>
          }
        >
          <CourseGrid />
        </Suspense>
      </div>
    </div>
  );
}

function SkeletonCourseCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <SkeletonText className="w-3/4" />
        </CardTitle>
        <CardDescription>
          <SkeletonText className="w-1/2" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SkeletonText rows={3} />
      </CardContent>
      <CardFooter>
        <SkeletonButton />
      </CardFooter>
    </Card>
  );
}

async function CourseGrid() {
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (userId == null) return redirectToSignIn();

  const courses = await getUserCourses(userId);

  console.log(courses, "---------------courses");

  if (courses.length === 0) {
    return (
      <div className="flex flex-col gap-2 items-start">
        구매한 강의가 없습니다.
        <Button asChild size="lg">
          <Link href="/">
            메인 이동
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>
    );
  }

  return courses.map((course) => (
    <Card key={course.id} className="overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <CardDescription>
          {course.sectionsCount}코스 &#183; {course.lessonsCount}레슨
        </CardDescription>
      </CardHeader>
      <CardContent className="line-clamp-3" title={course.description}>
        {course.description}
      </CardContent>
      <div className="flex-grow" />
      <CardFooter>
        <Button asChild>
          <Link href={`/courses/${course.id}`}>코스 이동 </Link>
        </Button>
      </CardFooter>
      <p className="mx-2 my-2">{`진행 상황: ${
        (course.lessonsComplete / course.lessonsCount) * 100
      }%`}</p>
      <div
        className="bg-accent h-2 -mt-2"
        style={{
          width: `${(course.lessonsComplete / course.lessonsCount) * 100}%`,
        }}
      />
    </Card>
  ));
}

async function getUserCourses(userId: string) {
  "use cache";
  cacheTag(
    getUserCourseAccessUserTag(userId),
    getUserLessonCompleteUserTag(userId)
  );

  const courses = await db
    .select({
      id: CourseTable.id,
      name: CourseTable.name,
      description: CourseTable.description,
      sectionsCount: countDistinct(CourseSectionTable.id),
      lessonsCount: countDistinct(LessonTable.id),
      lessonsComplete: countDistinct(UserLessonCompleteTable.lessonId),
    })
    .from(CourseTable)
    .leftJoin(
      UserCourseAccessTable,
      and(
        eq(UserCourseAccessTable.courseId, CourseTable.id),
        eq(UserCourseAccessTable.userId, userId)
      )
    )
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections
      )
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons)
    )
    .leftJoin(
      UserLessonCompleteTable,
      and(
        eq(UserLessonCompleteTable.lessonId, LessonTable.id),
        eq(UserLessonCompleteTable.userId, userId)
      )
    )
    .orderBy(CourseTable.name)
    .groupBy(CourseTable.id);

  courses.forEach((course) => {
    cacheTag(
      getCourseIdTag(course.id),
      getCourseSectionCourseTag(course.id),
      getLessonCourseTag(course.id)
    );
  });

  return courses;
}
