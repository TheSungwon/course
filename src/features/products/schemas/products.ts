import { productStatuses } from "@/drizzle/schema";
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "이름 입력해"),
  description: z.string().min(1, "설명 입력해"),
  //   priceInDollars: z.number().int().nonnegative(),
  priceInDollars: z
    .number()
    .refine(
      (val) => Number.isInteger(val) && val >= 0,
      "가격은 정수이고 음수가 아니어야 합니다."
    ),
  imageUrl: z.union([
    z.string().url("invalid url"),
    z.string().startsWith("/", "Invalid Url"),
  ]),
  status: z.enum(productStatuses),
  courseIds: z.array(z.string()).min(1, "At least one course is required"),
});
