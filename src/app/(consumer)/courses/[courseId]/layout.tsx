import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { getCurrentUser } from "@/services/clerk";
import { asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import React, { ReactNode, Suspense } from "react";
import { CoursePageClient } from "./_client";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/userLessonComplete";

export default async function CoursePageLayout({
  params,
  children,
}: {
  params: Promise<{ courseId: string }>;
  children: ReactNode;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (course == null) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[300px,1fr] gap-8 py-8">
          <div className="space-y-6">
            <div className="text-2xl font-semibold tracking-tight">
              {course.name}
            </div>

            <Suspense
              fallback={
                <CoursePageClient
                  course={mapCourse({ course, completedLessonIds: [] })}
                />
              }
            >
              <SuspenseBoundary course={course} />
            </Suspense>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.CourseTable.findFirst({
    where: eq(CourseTable.id, id),
    columns: { id: true, name: true },
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        where: wherePublicCourseSections,
        columns: { id: true, name: true },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            where: wherePublicLessons,
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

async function SuspenseBoundary({
  course,
}: {
  course: {
    name: string;
    id: string;
    courseSections: {
      id: string;
      name: string;
      lessons: {
        id: string;
        name: string;
      }[];
    }[];
  };
}) {
  const { userId } = await getCurrentUser();

  const completedLessonIds =
    userId == null ? [] : await getCompletedLessonIds(userId);

  return (
    <CoursePageClient course={mapCourse({ course, completedLessonIds })} />
  );
}

async function getCompletedLessonIds(userId: string) {
  "use cache";
  cacheTag(getUserLessonCompleteUserTag(userId));

  const data = await db.query.UserLessonCompleteTable.findMany({
    columns: { lessonId: true },
    where: eq(UserLessonCompleteTable.userId, userId),
  });

  return data.map((d) => d.lessonId);
  // return data.map(({ lessonId }) => lessonId);
}

function mapCourse({
  course,
  completedLessonIds,
}: {
  course: {
    name: string;
    id: string;
    courseSections: {
      id: string;
      name: string;
      lessons: {
        id: string;
        name: string;
      }[];
    }[];
  };
  completedLessonIds: string[];
}) {
  return {
    ...course,
    courseSections: course.courseSections.map((section) => {
      return {
        ...section,
        lessons: section.lessons.map((lesson) => {
          return {
            ...lesson,
            isComplete: completedLessonIds.includes(lesson.id),
          };
        }),
      };
    }),
  };
}
