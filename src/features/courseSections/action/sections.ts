"use server";

import { getCurrentUser } from "@/services/clerk";
import { z } from "zod";
import { sectionSchema } from "../schemas/section";
import {
  canCreateCourseSections,
  canDeleteCourseSections,
  canUpdateCourseSections,
} from "../permissions/sections";
import {
  getNextCourseSectionOrder,
  insertSection,
  updateSection as updateSectionDB,
  deleteSection as deleteSectionDB,
  updateSectionOrders as updateSectionOrdersDb,
} from "../db/sections";

export async function createSection(
  courseId: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);

  console.log(
    !success,
    !canCreateCourseSections(await getCurrentUser()),
    !success || !canCreateCourseSections(await getCurrentUser()),
    "canCreateCourseSections"
  );
  if (!success || !canCreateCourseSections(await getCurrentUser())) {
    return {
      error: true,
      message: "There was an error creating your section 생성 실패",
    };
  }

  const order = await getNextCourseSectionOrder(courseId);

  await insertSection({ ...data, courseId, order });

  return { error: false, message: "section 성공" };
}

export async function updateSection(
  id: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);

  if (!success || !canUpdateCourseSections(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your section" };
  }

  await updateSectionDB(id, data);
  console.log("update section ------------features/sections/actions/sections");
  return { error: false, message: "Successfully updated section" };
}

export async function deleteSection(id: string) {
  if (!canDeleteCourseSections(await getCurrentUser())) {
    return { error: true, message: "There was an error deleting your section" };
  }

  await deleteSectionDB(id);
  console.log("delete section ------------features/sections/actions/sections");
  return { error: false, message: "Successfully deleted section" };
}

export async function updateSectionOrders(sectionIds: string[]) {
  if (
    sectionIds.length === 0 ||
    !canUpdateCourseSections(await getCurrentUser())
  ) {
    return {
      error: true,
      message: "There was an error updating your section orders",
    };
  }

  await updateSectionOrdersDb(sectionIds);
  return { error: false, message: "Successfully updated section orders" };
}
