import { db } from "@/drizzle/db";
import { ProductTable, UserTable } from "@/drizzle/schema";
import { addUserCourseAccess } from "@/features/courses/db/userCourseAccess";
import { insertPurchase } from "@/features/purchases/purchases";
import { getUserCoupon } from "@/lib/userCountryHeader";
import { stripeServerClient } from "@/services/stripe/stripeServer";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  const stripeSessionId = request.nextUrl.searchParams.get("stripeSessionId");
  if(stripeSessionId == null) redirect("/products/purchase-failure");

  let redirectUrl : string;
    try{
        const checkoutSession = await stripeServerClient.checkout.sessions.retrieve(stripeSessionId,
            {
                expand: ["line_items",]
            }
        )

        const productId = await processStripeCheckout(checkoutSession);

    }
  
}

export async function POST() {}


async function processStripeCheckout(checkoutSession: Stripe.Checkout.Session){

    const userId = checkoutSession.metadata?.userId;
    const productId = checkoutSession.metadata?.productId;

    if(userId == null || productId == null){
        throw new Error("Missing Metadata");
    }

    const [product, user] = await Promise.all([
        getProduct(productId),
        getUser(userId) //await getUser(userId) ???
    ])

    if(product == null) throw new Error("Product not found");
    if(user == null) throw new Error("User not found");

    const courseIds = product.courseProducts.map(cp => cp.courseId);

    await addUserCourseAccess({userId: user.id, courseIds});

    await insertPurchase({
        stripeSessionId : checkoutSession.id,
        pricePaidInCents : checkoutSession.amount_total || product.priceInDollars,
        productDetails : product,
        userId: user.id,
        productId
    });

    return productId;
}

async function getProduct(productId: string){
    return await db.query.ProductTable.findFirst({
        columns:{
            id:true,
            priceInDollars: true,
            name: true,
            imageUrl: true,
            description: true,
        },
        where:eq(ProductTable.id, productId),
        with:{
            courseProducts:{ columns: {courseId : true}}
        }
    })
}

async function getUser(userId: string){
    return await db.query.UserTable.findFirst({
        columns: {
            id: true,
        },
        where : eq(UserTable.id, userId)

    })
}