"use server";

import { courseSchema } from "../schemas/courses";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/clerk";
import { z } from "zod";
import { canCreateCourses, canDeleteCourses } from "../permissions/courses";
import { insertCourse, deleteCourse as deleteCrouseDB } from "../db/courses";

interface Course {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData);

  if (!success || !canCreateCourses(await getCurrentUser())) {
    return { error: true, message: "There was an error creating your course" };
  }

  const course = await insertCourse(data as Course);
  console.log(course, "------------features/courses/actions/courses");

  redirect(`/admin/courses/${course.id}/edit`);
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
