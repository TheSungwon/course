"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/clerk";
import { z } from "zod";
import { sectionSchema } from "../schemas/section";
import { canCreateCourseSections } from "../permissions/sections";
import { insertSection } from "../db/sections";

export async function createCourse(
  courseId: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);

  if (!success || !canCreateCourseSections(await getCurrentUser())) {
    return { error: true, message: "There was an error creating your course" };
  }

  await insertSection({ ...data, courseId });

  return { error: false, message: "section 성공" };
}

export async function updateCourse(
  id: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);

  if (!success || !canUpdateCourses(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your course" };
  }

  await updateCourseDB(id, data as Course);
  console.log("update course ------------features/courses/actions/courses");
  return { error: false, message: "Successfully updated course" };
  // redirect(`/admin/courses/${course.id}/edit`);
}

// function wait(number: number) {
//   console.log("wait ------------features/courses/actions/courses");
//   return new Promise((res) => setTimeout(res, number));
// }

export async function deleteCourse(id: string) {
  // await wait(2000);

  if (!canDeleteCourses(await getCurrentUser())) {
    return { error: true, message: "There was an error deleting your course" };
  }

  await deleteCrouseDB(id);
  console.log("delete course ------------features/courses/actions/courses");
  return { error: false, message: "Successfully deleted course" };
}
