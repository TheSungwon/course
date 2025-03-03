import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getLessonGlobalTag() {
  return getGlobalTag("lessons");
}

export function getLessonIdTag(id: string) {
  return getIdTag("lessons", id);
}

export function getLessonCourseTag(courseId: string) {
  return getUserTag("lessons", courseId);
}

export function revalidateLessonCache({
  id,
  courseId,
}: {
  id: string;
  courseId: string;
}) {
  revalidateTag(getLessonGlobalTag());
  revalidateTag(getLessonIdTag(id));
  revalidateTag(getLessonCourseTag(courseId));
}
