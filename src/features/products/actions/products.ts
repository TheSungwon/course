"use server";
import { getCurrentUser } from "@/services/clerk";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  canCreateProducts,
  canDeleteProducts,
  canUpdateProducts,
} from "../permissions/products";
import {
  deleteProductDB,
  insertProductDB,
  updateProductDB,
} from "../db/products";
import { productSchema } from "../schemas/products";

export async function createProduct(unsafeData: z.infer<typeof productSchema>) {
  const { success, data } = productSchema.safeParse(unsafeData);

  if (!success || !canCreateProducts(await getCurrentUser())) {
    return { error: true, message: "There was an error creating your product" };
  }

  await insertProductDB(data);

  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  unsafeData: z.infer<typeof productSchema>
) {
  const { success, data } = productSchema.safeParse(unsafeData);

  if (!success || !canUpdateProducts(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your product" };
  }

  await updateProductDB(data);

  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  if (!canDeleteProducts(await getCurrentUser()))
    return { error: true, message: "Error deleting your product" };

  await deleteProductDB(id);

  return { error: false, message: "Successfully deleted your product" };
}
