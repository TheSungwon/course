import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { db } from "@/drizzle/db";
import { CourseProductTable, PurchaseTable } from "@/drizzle/schema";
import { ProductTable as dbProductTable } from "@/drizzle/schema";
import { ProductTable } from "@/features/products/components/ProductTable";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await getProducts();
  // console.log(courses, "----------getCourses()---------");
  return (
    <div className="container my-6">
      <PageHeader title="Products">
        <Button asChild>
          <Link href="/admin/products/new">New Products</Link>
        </Button>
      </PageHeader>

      <ProductTable products={products} />
    </div>
  );
}

async function getProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  return db
    .select({
      id: dbProductTable.id,
      name: dbProductTable.name,
      status: dbProductTable.status,

      priceInDollars: dbProductTable.priceInDollars,
      description: dbProductTable.description,
      imageUrl: dbProductTable.imageUrl,

      courseCount: countDistinct(CourseProductTable.courseId),
      customerCount: countDistinct(PurchaseTable.userId),
    })
    .from(dbProductTable)
    .leftJoin(
      CourseProductTable,
      eq(CourseProductTable.productId, dbProductTable.id)
    )
    .leftJoin(PurchaseTable, eq(PurchaseTable.productId, dbProductTable.id))
    .orderBy(asc(dbProductTable.name))
    .groupBy(dbProductTable.id);
}
