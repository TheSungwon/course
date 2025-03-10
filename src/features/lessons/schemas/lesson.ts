import { lessonStatusEnum } from "@/drizzle/schema";
import { z } from "zod";

export const lessonSchema = z.object({
  name: z.string().min(1, "이름 입력해"),
  sectionId: z.string().min(1, "설명 입력해"),
  status: z.enum(lessonStatusEnum.enumValues),
  youtubeVideoId: z.string().min(1, "유튜브 입력해"),
  description: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .nullable(),
});
