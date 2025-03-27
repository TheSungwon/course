import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { getProductIdTag } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Image from "next/image";
import Link from "next/link";

export default async function ProductPurchaseSuccessPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const product = await getPublicProduct(productId);

  if (product == null) return;

  return (
    <div className="container my-6">
      <div className="flex gap-16 items-center justify-between">
        <div className="flex flex-col gap-4 items-start">
          <div className="text-3xl font-semibold">결제 성공</div>
          <div className="text-xl">
            Thank you for your purchase.
            <br />
            <span className="animate- inline-block font-semibold from-orange-400 to-violet-500 bg-gradient-to-br bg-clip-text text-transparent">
              {product.name}
            </span>{" "}
            을 구매해주셔서 감사합니다.
          </div>
          <Button asChild className="text-xl h-auto py-4 px-8 rounded-lg">
            <Link href="/courses">Course로 이동</Link>
          </Button>
        </div>
        <div className="relative aspect-video max-w-lg flex-grow">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.ProductTable.findFirst({
    columns: {
      name: true,
      imageUrl: true,
    },
    where: and(eq(ProductTable.id, id), wherePublicProducts),
  });
}
