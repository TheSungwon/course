import { db } from "@/drizzle/db";
import {
  CourseProductTable,
  ProductTable,
  PurchaseTable,
} from "@/drizzle/schema";
import { and, eq, isNull } from "drizzle-orm";
import { revalidateProductCache } from "./cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getPurchaseUserTag } from "@/features/purchases/db/cache";

export async function getUserOwnsProduct({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  "use cache";
  cacheTag(getPurchaseUserTag(userId));

  const existingPurchase = await db.query.PurchaseTable.findFirst({
    where: and(
      eq(PurchaseTable.productId, productId),
      eq(PurchaseTable.userId, userId),
      isNull(PurchaseTable.refundedAt)
    ),
  });

  return existingPurchase != null;
}

export async function insertProductDB(
  data: typeof ProductTable.$inferInsert & { courseIds: string[] }
) {
  const newProduct = await db.transaction(async (trx) => {
    const [newProduct] = await trx
      .insert(ProductTable)
      .values(data)
      .returning();
    if (newProduct == null) {
      trx.rollback();
      throw new Error("Failed to insert product");
    }

    const ccc = await trx.insert(CourseProductTable).values(
      data.courseIds.map((courseId) => ({
        courseId,
        productId: newProduct.id,
      }))
    );

    console.log(newProduct, "newProduct");
    console.log(ccc, "courseId");
    new Promise((res) => setTimeout(res, 10000));
    return newProduct;
  });

  revalidateProductCache(newProduct.id);

  return newProduct;
}
export async function updateProductDB(
  id: string,
  data: Partial<typeof ProductTable.$inferInsert & { courseIds: string[] }>
) {
  const updatedProduct = await db.transaction(async (trx) => {
    const [updatedProduct] = await trx
      .update(ProductTable)
      .set(data)
      .where(eq(ProductTable.id, id))
      .returning();

    if (updatedProduct == null) {
      trx.rollback();
      throw new Error("Failed to update product");
    }

    await trx
      .delete(CourseProductTable)
      .where(eq(CourseProductTable.productId, id));

    if (data.courseIds) {
      await trx.insert(CourseProductTable).values(
        data.courseIds.map((courseId) => ({
          courseId,
          productId: updatedProduct.id,
        }))
      );
    }

    return updatedProduct;
  });

  revalidateProductCache(updatedProduct.id);
  return updatedProduct;
}

export async function deleteProductDB(id: string) {
  const [deletedProduct] = await db
    .delete(ProductTable)
    .where(eq(ProductTable.id, id))
    .returning();
  if (deletedProduct == null) throw new Error("Failed to delete product");

  revalidateProductCache(deletedProduct.id);

  return deletedProduct;
}
