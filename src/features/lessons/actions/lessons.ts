"use server";

import { getCurrentUser } from "@/services/clerk";
import { z } from "zod";
import {
  canCreateLessons,
  canDeleteLessons,
  canUpdateLessons,
} from "../permissions/lessons";
import {
  getNextLessonOrder,
  insertLesson,
  updateLesson as updateLessonDB,
  deleteLesson as deleteLessonDB,
  updateLessonOrders as updateLessonOrdersDb,
} from "../db/lessons";
import { lessonSchema } from "../schemas/lesson";

export async function createLesson(unsafeData: z.infer<typeof lessonSchema>) {
  const { success, data } = lessonSchema.safeParse(unsafeData);

  if (!success || !canCreateLessons(await getCurrentUser())) {
    return {
      error: true,
      message: "There was an error creating your lesson 생성 실패",
    };
  }

  const order = await getNextLessonOrder(data.sectionId);

  await insertLesson({ ...data, order });

  return { error: false, message: "section 성공" };
}

export async function updateLesson(
  id: string,
  unsafeData: z.infer<typeof lessonSchema>
) {
  const { success, data } = lessonSchema.safeParse(unsafeData);

  if (!success || !canUpdateLessons(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your 레슨" };
  }

  await updateLessonDB(id, data);
  return { error: false, message: "Successfully updated Lesson" };
}

export async function deleteLesson(id: string) {
  if (!canDeleteLessons(await getCurrentUser())) {
    return { error: true, message: "There was an error deleting your 레슨" };
  }

  await deleteLessonDB(id);
  return { error: false, message: "Successfully deleted 레슨" };
}

export async function updateLessonOrders(lessonIds: string[]) {
  if (lessonIds.length === 0 || !canUpdateLessons(await getCurrentUser())) {
    return {
      error: true,
      message: "There was an error updating your 레슨 orders",
    };
  }

  await updateLessonOrdersDb(lessonIds);
  return { error: false, message: "Successfully updated 레슨 orders" };
}
