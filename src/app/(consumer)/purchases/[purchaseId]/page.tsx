import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { getPurchaseIdTag } from "@/features/purchases/db/cache";
import { formatDate } from "@/lib/formatters";
import { getCurrentUser } from "@/services/clerk";
import { stripeServerClient } from "@/services/stripe/stripeServer";
import { and, eq } from "drizzle-orm";
import { ReceiptPoundSterling } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Stripe from "stripe";

export default async function PurchasesPage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const { purchaseId } = await params;

  return (
    <div className="container my-6">
      <Suspense fallback={<LoadingSpinner className="size-36 mx-auto" />}>
        <SuspenseBoundary purchaseId={purchaseId} />
      </Suspense>
    </div>
  );
}

async function SuspenseBoundary({ purchaseId }: { purchaseId: string }) {
  const { userId, redirectToSignIn, user } = await getCurrentUser({
    allData: true,
  });

  if (userId == null || user == null) {
    redirectToSignIn();
    return null;
  }

  const purchase = await getPurchase({ userId, id: purchaseId });

  if (purchase == null) return notFound();

  const { receiptUrl, pricingRows } = await getStripeDetails(
    purchase.stripeSessionId,
    purchase.pricePaidInCents,
    purchase.refundedAt != null
  );

  return (
    <>
      <PageHeader title={purchase.productDetails.name}>
        {receiptUrl && (
          <Button variant="outline" asChild>
            <Link target="_blank" href={receiptUrl}>
              영수증
            </Link>
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle>영수증</CardTitle>
              <CardDescription> 아이디 : {purchaseId}</CardDescription>
            </div>
            <Badge className="text-base">
              {purchase.refundedAt ? "환불" : "구매"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 grid grid-cols-2 gap-8 border-t pt-4">
          <div>
            <label className="text-sm text-muted-foreground">날짜</label>
            <div>{formatDate(purchase.createdAt)}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Product</label>
            <div>{purchase.productDetails.name}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">고객명</label>
            <div>{user.name}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">판매자</label>
            <div>thesungwon</div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

async function getPurchase({ userId, id }: { userId: string; id: string }) {
  "use cache";
  cacheTag(getPurchaseIdTag(id));

  return db.query.PurchaseTable.findFirst({
    columns: {
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
      stripeSessionId: true,
    },
    where: and(eq(PurchaseTable.id, id), eq(PurchaseTable.userId, userId)),
  });
}

async function getStripeDetails(
  stripeSessionId: string,
  pricePaidInCents: number,
  isRefunded: boolean
) {
  const { payment_intent, total_details, amount_total, amount_subtotal } =
    await stripeServerClient.checkout.sessions.retrieve(stripeSessionId, {
      expand: [
        "payment_intent.latest_charge",
        "total_details.breakdown.discounts",
      ],
    });

  const refundAmount =
    typeof payment_intent !== "string" &&
    typeof payment_intent?.latest_charge !== "string"
      ? payment_intent?.latest_charge?.amount_refunded
      : isRefunded
      ? pricePaidInCents
      : undefined;

  return {
    receiptUrl: getReceiptUrl(payment_intent),
    pricingRows: getPricingRows(total_details.details, {
      total: (amount_total ?? pricePaidInCents) - (refundAmount ?? 0),
      subtotal: amount_subtotal ?? pricePaidInCents,
      refund: refundAmount,
    }),
  };
}

function getReceiptUrl(paymentIntent: Stripe.PaymentIntent | string | null) {
  if (
    typeof paymentIntent === "string" ||
    typeof paymentIntent?.latest_charge === "string"
  ) {
    return;
  }

  return paymentIntent?.latest_charge?.receipt_url;
}

function getPricingRows(
  totalDetails: Stripe.Checkout.Session.TotalDetails | null,
  {
    total,
    subtotal,
    refund,
  }: {
    total: number;
    subtotal: number;
    refund?: number;
  }
) {
  const pricingRows: {
    label: string;
    amountInDollars: number;
    isBold?: boolean;
  }[] = [];

  if (totalDetails?.breakdown != null) {
    totalDetails.breakdown.discounts.forEach((discount) => {
      pricingRows.push({
        label: `${discount.discount.coupon.name} (${discount.discount.coupon.percent_off}% 할인)`,
        amountInDollars: discount.amount,
      });
    });
  }

  if (refund) {
    pricingRows.push({
      label: "환불",
      amountInDollars: refund / 100,
    });
  }

  if (pricingRows.length === 0) {
    return [{ label: "total", amountInDollars: total / 100, isBold: true }];
  }

  return [
    {
      label: "subtotal",
      amountInDollars: subtotal / 100,
    },
    ...pricingRows,
    {
      label: "total",
      amountInDollars: total / 100,
      isBold: true,
    },
  ];
}
