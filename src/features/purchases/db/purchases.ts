import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { revalidatePurchaseCache } from "./cache";
import { eq } from "drizzle-orm";

// stripeSessionId : checkoutSession.id,
// pricePaidInCents : checkoutSession.amount_total || product.priceInDollars.toExponential,
// productDetails : product,
// userId: user.id,
// productId
export async function insertPurchase(
  data: typeof PurchaseTable.$inferInsert,
  trx: Omit<typeof db, "$client"> = db
) {
  const details = data.productDetails;

  const [newPurchase] = await trx
    .insert(PurchaseTable)
    .values({
      ...data,
      productDetails: {
        name: details.name,
        description: details.description,
        imageUrl: details.imageUrl,
      },
    })
    .onConflictDoNothing()
    .returning();

  if (newPurchase != null) revalidatePurchaseCache(newPurchase);

  return newPurchase;
}

export async function updatePurchase(
  id: string,
  data: Partial<typeof PurchaseTable.$inferInsert>,
  trx: Omit<typeof db, "$client"> = db
) {
  const details = data.productDetails;

  const [updatedPurchase] = await trx
    .update(PurchaseTable)
    .set({
      ...data,
      productDetails: details
        ? {
            name: details.name,
            description: details.description,
            imageUrl: details.imageUrl,
          }
        : undefined,
    })
    .where(eq(PurchaseTable.id, id))
    .returning();

  if (updatedPurchase == null) throw new Error("구매 내역이 없습니다.");

  revalidatePurchaseCache(updatedPurchase);

  return updatedPurchase;
}
