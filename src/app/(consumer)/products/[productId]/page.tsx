import { SkeletonButton } from "@/components/SkeletonButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  LessonTable,
  ProductTable,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { getProductIdTag } from "@/features/products/db/cache";
import { getUserOwnsProduct } from "@/features/products/db/products";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { formatPlural, formatPrice } from "@/lib/formatters";
import { sumArray } from "@/lib/sumArray";
import { getUserCoupon } from "@/lib/userCountryHeader";
import { getCurrentUser } from "@/services/clerk";
import { and, asc, eq } from "drizzle-orm";
import { VideoIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);

  if (product == null) return notFound();

  const courseCount = product.courses.length;
  const lessonCount = sumArray(product.courses, (course) =>
    sumArray(course.courseSections, (s) => s.lessons.length)
  );

  return (
    <div className="container my-6">
      <div className="flex gap-16 items-center justify-between">
        <div className="flex gap-67 flex-col items-start">
          <div className="flex flex-col gap-2">
            <Suspense
              fallback={
                <div className="text-xl">
                  {formatPrice(product.priceInDollars)}
                </div>
              }
            >
              <Price price={product.priceInDollars}></Price>
            </Suspense>
            <h1 className="text-4xl font-semibold">{product.name}</h1>
            <div className="text-muted-foreground">
              {formatPlural(courseCount, {
                singular: "course",
                plural: "courses",
              })}{" "}
              &#183;{" "}
              {formatPlural(lessonCount, {
                singular: "lesson",
                plural: "lessons",
              })}
            </div>
          </div>
          <div className="text-xl mb-2">{product.description}</div>
          <Suspense fallback={<SkeletonButton className="h-12 w-36" />}>
            <PurchaseButton productId={product.id} />
          </Suspense>
        </div>

        <div className="relative aspect-video max-w-lg flex-grow">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain rounded-xl border-neutral-950 border-2 box-content"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 items-start">
        {product.courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                {formatPlural(course.courseSections.length, {
                  plural: "sections",
                  singular: "section",
                })}{" "}
                &#183;{" "}
                {formatPlural(
                  sumArray(course.courseSections, (s) => s.lessons.length),
                  {
                    plural: "lessons",
                    singular: "lesson",
                  }
                )}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Accordion type="multiple">
                {course.courseSections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="flex gap-2">
                      <div className="flex flex-col flex-grow">
                        <span className="text-lg">{section.name}</span>
                        <span className="text-muted-foreground">
                          {formatPlural(section.lessons.length, {
                            plural: "lessons",
                            singular: "lesson",
                          })}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="flex flex-col gap-2">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 text-base"
                        >
                          <VideoIcon className="size-4" />
                          {lesson.status === "preview" ? (
                            <Link
                              href={`/courses/${course.id}/lessons/${lesson.id}`}
                              className="underline text-accent"
                            >
                              {lesson.name}
                            </Link>
                          ) : (
                            lesson.name
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function PurchaseButton({ productId }: { productId: string }) {
  // await new Promise((resolve) => setTimeout(resolve, 3000)); //loading test
  const { userId } = await getCurrentUser();

  const alreadyOwnsProduct =
    userId != null && (await getUserOwnsProduct({ userId: userId, productId }));

  if (alreadyOwnsProduct) {
    return <p>You already own this product</p>;
  } else {
    return (
      <Button className="text-xl h-auto py-4 px-8 rounded-lg w-full" asChild>
        <Link href={`/products/${productId}/purchase`}>Get Now</Link>
      </Button>
    );
  }
}
async function Price({ price }: { price: number }) {
  const coupon = await getUserCoupon();

  if (price === 0 || coupon == null) {
    return <div className="text-xl">{formatPrice(price)}</div>;
  }

  return (
    <div className="flex gap-2 items-baseline">
      <div className="line-through text-sm opacity-50">
        {formatPrice(price)}
      </div>
      <div className="text-xl">
        {formatPrice(price * (1 - coupon.discountPercentage))}
        {/* {formatPrice(price * (1 - coupon.discountPercentage / 100))} USD일 때 적용 */}
      </div>
    </div>
  );
}

async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  const product = await db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },

    where: and(eq(ProductTable.id, id), wherePublicProducts), //eq(ProductTable.status, "public");
    with: {
      courseProducts: {
        columns: {},
        with: {
          course: {
            columns: { id: true, name: true },
            with: {
              courseSections: {
                columns: { id: true, name: true },
                where: wherePublicCourseSections, //eq(CourseSectionTable.status, "public");
                orderBy: asc(CourseSectionTable.order),
                with: {
                  lessons: {
                    columns: { id: true, name: true, status: true },
                    where: wherePublicLessons, // or(eq(LessonTable.status, "public"), eq(LessonTable.status, "preview"));
                    orderBy: asc(LessonTable.order),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (product == null) return product;

  cacheTag(
    ...product.courseProducts.flatMap((cp) => [
      getLessonCourseTag(cp.course.id),
      getCourseSectionCourseTag(cp.course.id),
      getCourseIdTag(cp.course.id),
    ])
  );

  const { courseProducts, ...other } = product;

  return {
    ...other,
    courses: courseProducts.map((cp) => cp.course),
  };
}
