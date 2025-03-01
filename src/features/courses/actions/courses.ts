"use server";

// import { courseSchema } from "../schemas/courses";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/clerk";
import { z } from "zod";
import { canCreateCourses } from "../permissions/courses";
import { insertCourse } from "../db/courses";

const courseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData);

  if (!success || !canCreateCourses(await getCurrentUser())) {
    return { error: true, message: "There was an error creating your course" };
  }

  const course = await insertCourse(data);
  console.log(course, "------------features/courses/actions/courses");

  redirect(`/admin/courses/${course.id}edit`);
}
