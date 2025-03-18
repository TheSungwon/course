import { db } from "@/drizzle/db";
import { CourseProductTable, ProductTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateProductCache } from "./cache";

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
  return;
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
