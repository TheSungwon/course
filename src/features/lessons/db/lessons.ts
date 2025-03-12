import { db } from "@/drizzle/db";
import { CourseSectionTable, LessonTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateLessonCache } from "./cache/lessons";

export async function getNextLessonOrder(sectionId: string) {
  const lesson = await db.query.LessonTable.findFirst({
    columns: { order: true },
    where: ({ sectionId: sectionIdCol }, { eq }) => eq(sectionIdCol, sectionId),
    orderBy: ({ order }, { desc }) => desc(order),
  });

  return lesson ? lesson.order + 1 : 0;
}

export async function insertLesson(data: typeof LessonTable.$inferInsert) {
  const [newLesson, courseId] = await db.transaction(async (trx) => {
    const [[newLesson], section] = await Promise.all([
      trx.insert(LessonTable).values(data).returning(),
      trx.query.CourseSectionTable.findFirst({
        columns: { courseId: true },
        where: eq(CourseSectionTable.id, data.sectionId),
      }),
    ]);

    if (section == null) return trx.rollback();

    return [newLesson, section.courseId];
  });

  if (newLesson == null) throw new Error("레슨 생성 실패");

  revalidateLessonCache({ courseId, id: newLesson.id });

  return newLesson;
}

export async function updateLesson(
  id: string,
  data: Partial<typeof LessonTable.$inferInsert>
) {
  const [updatedLesson, courseId] = await db.transaction(async (trx) => {
    const currentLesson = await trx.query.LessonTable.findFirst({
      columns: { sectionId: true },
      where: eq(LessonTable.id, id),
    });

    if (
      data.sectionId != null &&
      currentLesson?.sectionId !== data.sectionId &&
      data.order == null
    ) {
      data.order = await getNextLessonOrder(data.sectionId);
    }

    const [updatedLesson] = await trx
      .update(LessonTable)
      .set(data)
      .where(eq(LessonTable.id, id))
      .returning();

    if (updatedLesson == null) throw new Error("레슨 수정 실패");

    const section = await trx.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
      where: eq(CourseSectionTable.id, updatedLesson.sectionId),
    });

    if (section == null) return trx.rollback();

    return [updatedLesson, section.courseId];
  });

  revalidateLessonCache({ courseId, id: updatedLesson.id });

  return updatedLesson;
}

export async function deleteLesson(id: string) {
  const [deletedLesson, courseId] = await db.transaction(async (trx) => {
    const [deletedLesson] = await trx
      .delete(LessonTable)
      .where(eq(LessonTable.id, id))
      .returning();

    if (deletedLesson == null) {
      trx.rollback();
      throw new Error("레슨 삭제 실패");
    }

    const section = await trx.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
      where: ({ id }, { eq }) => eq(id, deletedLesson.sectionId),
    });

    if (section == null) return trx.rollback();

    return [deletedLesson, section.courseId];
  });

  if (deletedLesson == null) throw new Error("레슨 삭제 실패");

  revalidateLessonCache({ courseId, id: deletedLesson.id });

  return deletedLesson;
}

export async function updateLessonOrders(lessonIds: stringp[]) {
  const [lessons, courseId] = await db.transaction(async (trx) => {
    const lessons = await Promise.all(
      lessonIds.map((id, index) =>
        db
          .update(LessonTable)
          .set({ order: index })
          .where(eq(LessonTable.id, id))
          .returning({
            sectionId: LessonTable.sectionId,
            id: LessonTable.id,
          })
      )
    );

    const sectionId = lessons[0]?.[0]?.sectionId;
    if (sectionId == null) return trx.rollback();

    const section = await trx.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
    });
  });
}
