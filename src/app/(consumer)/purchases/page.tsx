import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { getPurchaseUserTag } from "@/features/purchases/db/cache";
import { UserPurchaseTable } from "@/features/purchases/db/components/UserPurchaseTable";
import { getCurrentUser } from "@/services/clerk";
import { desc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

export default async function PurchasesPage() {
  return (
    <div className="container my-6">
      <PageHeader title="Purchases History" />
      <Suspense fallback={<UserPurchaseTableSkeleton />}>
        <SuspenseBoundary />
      </Suspense>
    </div>
  );
}

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (userId == null) return redirectToSignIn();

  const purchases = await getPurchases(userId);

  if (purchases.length) {
    return (
      <div className="flex flex-col gap-2 items-start ">
        you have no purchases
        <Button asChild size="lg">
          <Link href="/">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return <UserPurchaseTable purchases={purchases} />;
}

async function getPurchases(userId: string) {
  "use cache";
  cacheTag(getPurchaseUserTag(userId));

  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    where: eq(PurchaseTable.userId, userId),
    orderBy: desc(PurchaseTable.createdAt),
  });
}
