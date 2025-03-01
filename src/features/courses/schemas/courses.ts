import { z } from "zod";

export const courseSchema = z.object({
  name: z.string().min(1, "이름 입력해"),
  description: z.string().min(1, "설명 입력해"),
  // id: z.string().min(1),
  // createdAt: z.date(),
  // updatedAt: z.date(),
});
