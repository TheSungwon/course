import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { getProductIdTag } from "@/features/products/db/cache";
import { getUserOwnsProduct } from "@/features/products/db/products";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { getCurrentUser } from "@/services/clerk";
import { StripCheckoutForm } from "@/services/stripe/components/StripeCheckoutForm";
import { SignIn, SignUp } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export default function PurchasePage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner className="my-6 size-36 mx-auto" />}>
      <SuspenseComponent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SuspenseComponent({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
}) {
  console.log(await params, "--------params---");
  console.log(await searchParams, "-----------searchParams");

  const { productId } = await params;

  const { user } = await getCurrentUser({ allData: true });
  const product = await getPublicProduct(productId);

  if (product == null) {
    return notFound();
  }

  if (user != null) {
    if (await getUserOwnsProduct({ userId: user.id, productId })) {
      redirect("/course");
    }

    return (
      <div className="container my-6">
        <StripCheckoutForm product={product} user={user} />
      </div>
    );
  }

  const { authMode } = await searchParams;
  const isSignUp = authMode === "signUp";

  return (
    <div className="container my-6 flex flex-col items-center">
      <PageHeader title="로그인 후 이용가능 합니다." />
      {isSignUp ? (
        <SignUp
          routing="hash"
          signInUrl={`/products/${productId}/purchase?authMode=signIn`}
          forceRedirectUrl={`/products/${productId}/purchase`}
        />
      ) : (
        <SignIn
          routing="hash"
          signUpUrl={`/products/${productId}/purchase?authMode=signUp`}
          forceRedirectUrl={`/products/${productId}/purchase`}
        />
      )}
    </div>
  );
}

async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.ProductTable.findFirst({
    columns: {
      name: true,
      id: true,
      imageUrl: true,
      description: true,
      priceInDollars: true,
    },
    where: and(eq(ProductTable.id, id), wherePublicProducts), //export const wherePublicProducts = eq(ProductTable.status, "public");
  });
}
