import { courseSectionStatuses } from "@/drizzle/schema";
import { z } from "zod";

export const sectionSchema = z.object({
  name: z.string().min(1, "이름 입력해"),
  status: z.enum(courseSectionStatuses),
});
