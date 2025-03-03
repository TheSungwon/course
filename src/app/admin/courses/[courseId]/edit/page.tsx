import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );
}
