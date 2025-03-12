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


export async function insertLesson(data: typeof LessonTable.$inferInsert){
  const [newLesson, courseId] =
  await db.transaction(async trx => {
    const [[newLesson], section] = 
    await Promise.all([trx.insert(LessonTable).values(data).returning(),
        trx.query.CourseSectionTable.findFirst({
          columns:{courseId:true},
          where: eq(CourseSectionTable.id, data.sectionId),
        })
    ]);

    if(section == null) return trx.rollback();

    return [newLesson, section.courseId];
  })

  if(newLesson == null) throw new Error("레슨 생성 실패");

  revalidateLessonCache({courseId, id:newLesson.id});

  return newLesson;
}
export async function updateLesson(id:string, data: Partial<typeof LessonTable.$inferInsert>){

  const [updatedLesson, courseId] =
  await db.transaction(async trx => {

   
  })

  if(updatedLesson == null) throw new Error("레슨 생성 실패");

  revalidateLessonCache({courseId, id:updatedLesson.id});

  return updatedLesson;
}