import { env } from "@/data/env/server";
import { db } from "@/drizzle/db";
import { ProductTable, UserTable } from "@/drizzle/schema";
import { addUserCourseAccess } from "@/features/courses/db/userCourseAccess";
import { insertPurchase } from "@/features/purchases/db/purchases";
import { stripeServerClient } from "@/services/stripe/stripeServer";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  const stripeSessionId = request.nextUrl.searchParams.get("stripeSessionId");
  if (stripeSessionId == null) redirect("/products/purchase-failure");

  let redirectUrl: string;
  try {
    const checkoutSession = await stripeServerClient.checkout.sessions.retrieve(
      stripeSessionId,
      {
        expand: ["line_items"],
      }
    );

    const productId = await processStripeCheckout(checkoutSession);

    redirectUrl = `/products/${productId}/purchase/success`;
  } catch {
    redirectUrl = `/products/purchase-failure`;
  }

  return NextResponse.redirect(new URL(redirectUrl, request.url));
  //localhost:3000/products/1/purchase/success
}

export async function POST(request: NextRequest) {
  const event = await stripeServerClient.webhooks.constructEvent(
    await request.text(),
    request.headers.get("stripe-signature") as string,
    env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      try {
        await processStripeCheckout(event.data.object);
      } catch {
        return new Response(null, { status: 500 });
      }
    }
  }
  return new Response(null, { status: 200 });
}

async function processStripeCheckout(checkoutSession: Stripe.Checkout.Session) {
  const userId = checkoutSession.metadata?.userId;
  const productId = checkoutSession.metadata?.productId;

  if (userId == null || productId == null) {
    throw new Error("Missing Metadata");
  }

  const [product, user] = await Promise.all([
    getProduct(productId),
    getUser(userId), //await getUser(userId) ???
  ]);

  if (product == null) throw new Error("Product not found");
  if (user == null) throw new Error("User not found");

  const courseIds = product.courseProducts.map((cp) => cp.courseId);

  db.transaction(async (trx) => {
    try {
      await addUserCourseAccess({ userId: user.id, courseIds }, trx);

      await insertPurchase(
        {
          stripeSessionId: checkoutSession.id,
          pricePaidInCents:
            checkoutSession.amount_total || product.priceInDollars,
          productDetails: product,
          userId: user.id,
          productId,
        },
        trx
      );
    } catch (error) {
      trx.rollback();
      throw error;
    }
  });

  return productId;
}

async function getProduct(productId: string) {
  return await db.query.ProductTable.findFirst({
    columns: {
      id: true,
      priceInDollars: true,
      name: true,
      imageUrl: true,
      description: true,
    },
    where: eq(ProductTable.id, productId),
    with: {
      courseProducts: { columns: { courseId: true } },
    },
  });
}

async function getUser(userId: string) {
  return await db.query.UserTable.findFirst({
    columns: {
      id: true,
    },
    where: eq(UserTable.id, userId),
  });
}
