"use server";

import { getCurrentUser } from "@/services/clerk";
import { canUpdateUserLessonCompleteStatus } from "../permissions/userLessonComplete";
import { updateLessonCompleteStatus as updateLessonCompleteStatusDb } from "../db/userLessonComplete";

export async function updateLessonCompleteStatus(
  lessonId: string,
  complete: boolean
) {
  const { userId } = await getCurrentUser();

  const hasPermission = await canUpdateUserLessonCompleteStatus(
    { userId },
    lessonId
  );

  if (userId == null || !hasPermission) {
    return { error: true, message: "수정 권한이 없습니다." };
  }

  await updateLessonCompleteStatusDb({ lessonId, userId, complete });

  return { error: false, message: "성공적으로 수정되었습니다." };
}
