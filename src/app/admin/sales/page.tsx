import { PageHeader } from "@/components/ui/PageHeader";
import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache";
import { PurchaseTb } from "@/features/purchases/db/components/PurchaseTb";
import { getUserGlobalTag } from "@/features/users/db/cache";
import { desc } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function SalesPage() {
  const purchases = await getPurchases();

  return (
    <div className="container my-6">
      <PageHeader title="할인" />
      <PurchaseTb purchases={purchases} />
    </div>
  );
}

async function getPurchases() {
  "use cache";
  cacheTag(getPurchaseGlobalTag(), getUserGlobalTag());

  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    orderBy: desc(PurchaseTable.createdAt),
    with: {
      user: {
        columns: {
          name: true,
        },
      },
    },
  });
}
