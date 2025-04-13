import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import { getUserCourseAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache";
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache";
import { formatNumber, formatPrice } from "@/lib/formatters";
import { count, countDistinct, isNotNull, sql, sum } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { ArrowRight, Book, BookOpen, Layers, Video } from "lucide-react";

// 엔티티 카드 컴포넌트
function EntityCard({
  icon: Icon,
  title,
  subtitle,
  bgColor,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div
      className="flex flex-col items-center p-4 rounded-lg"
      style={{ backgroundColor: bgColor }}
    >
      <Icon className={`w-8 h-8 mb-2 ${iconColor}`} />
      <span className="font-semibold">{title}</span>
      <span className="text-sm text-gray-500">{subtitle}</span>
    </div>
  );
}

// 관계 설명 컴포넌트
function RelationshipDescription() {
  const descriptions = [
    "Product(상품)는 여러 Course(강좌)를 포함할 수 있으며, 다대다(N:N) 관계를 가집니다.",
    "Course(강좌)는 여러 CourseSection(강좌 섹션)을 포함하며, 일대다(1:N) 관계를 가집니다.",
    "CourseSection(강좌 섹션)은 여러 Lesson(수업)을 포함하며, 일대다(1:N) 관계를 가집니다.",
    "각 Lesson(수업)은 YouTube 비디오 ID를 포함하며, public/private/preview 상태를 가질 수 있습니다.",
  ];

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">관계 설명</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-600">
        {descriptions.map((desc, index) => (
          <li key={index}>{desc}</li>
        ))}
      </ul>
    </div>
  );
}

// 관계도 컴포넌트
function RelationshipDiagram() {
  const relationships = [
    {
      from: {
        icon: Book,
        title: "Product",
        subtitle: "상품",
        bgColor: "rgb(239, 246, 255)",
        iconColor: "text-blue-600",
      },
      to: {
        icon: BookOpen,
        title: "Course",
        subtitle: "강좌",
        bgColor: "rgb(240, 253, 244)",
        iconColor: "text-green-600",
      },
      relation: "N:N 관계",
    },
    {
      from: {
        icon: BookOpen,
        title: "Course",
        subtitle: "강좌",
        bgColor: "rgb(240, 253, 244)",
        iconColor: "text-green-600",
      },
      to: {
        icon: Layers,
        title: "CourseSection",
        subtitle: "강좌 섹션",
        bgColor: "rgb(250, 245, 255)",
        iconColor: "text-purple-600",
      },
      relation: "1:N 관계",
    },
    {
      from: {
        icon: Layers,
        title: "CourseSection",
        subtitle: "강좌 섹션",
        bgColor: "rgb(250, 245, 255)",
        iconColor: "text-purple-600",
      },
      to: {
        icon: Video,
        title: "Lesson",
        subtitle: "수업",
        bgColor: "rgb(255, 247, 237)",
        iconColor: "text-orange-600",
      },
      relation: "1:N 관계",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        시스템 구조 관계도
      </h2>

      <div className="space-y-8">
        {relationships.map((rel, index) => (
          <div
            key={index}
            className="flex items-center justify-center space-x-4"
          >
            <EntityCard {...rel.from} />
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <EntityCard {...rel.to} />
            <div className="text-sm text-gray-500">{rel.relation}</div>
          </div>
        ))}
      </div>

      <RelationshipDescription />
    </div>
  );
}

export default async function AdminPage() {
  const {
    netSales,
    totalRefunds,
    netPurchases,
    refundedPurchases,
    averageNetPurchasePerCustomer,
  } = await getPurchaseDetails();

  return (
    <div className="container my-6 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 md:grid-cols-4 gap-4">
        <StatCard title="매출액">{formatPrice(netSales)}</StatCard>
        <StatCard title="환불액">{formatPrice(totalRefunds)}</StatCard>
        <StatCard title="구매건">{formatNumber(netPurchases)}</StatCard>
        <StatCard title="환불건">{formatNumber(refundedPurchases)}</StatCard>
        <StatCard title="고객당 평균 구매건">
          {formatNumber(averageNetPurchasePerCustomer, {
            maximumFractionDigits: 2,
          })}
        </StatCard>

        <StatCard title="고객수">
          {formatNumber(await getTotalStudents())}
        </StatCard>
        <StatCard title="PRODUCTS">
          {formatNumber(await getTotalProducts())}
        </StatCard>
        <StatCard title="COURSES">
          {formatNumber(await getTotalCourses())}
        </StatCard>
        <StatCard title="COURSE SECTIONS">
          {formatNumber(await getTotalCourseSections())}
        </StatCard>
        <StatCard title="LESSONS">
          {formatNumber(await getTotalLessons())}
        </StatCard>
      </div>

      <RelationshipDiagram />
    </div>
  );
}

function StatCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-bold text-2xl">{children}</CardTitle>
      </CardHeader>
    </Card>
  );
}

async function getPurchaseDetails() {
  "use cache";
  cacheTag(getPurchaseGlobalTag());

  const data = await db
    .select({
      // COALESCE: 첫 번째 NULL이 아닌 값을 반환하는 SQL 함수
      // sum: 지정된 컬럼의 모든 값의 합계를 계산
      // mapWith(Number): 결과를 숫자 타입으로 변환
      totalSales: sql<number>`COALESCE(${sum(
        PurchaseTable.pricePaidInCents
      )}, 0)`.mapWith(Number),

      // count: 테이블의 레코드 수를 계산
      totalPurchases: count(PurchaseTable.id),

      // countDistinct: 중복을 제외한 고유한 값의 수를 계산
      totalUsers: countDistinct(PurchaseTable.userId),

      // isNotNull: 해당 컬럼이 NULL이 아닌지 확인하는 조건
      isRefund: isNotNull(PurchaseTable.refundedAt),
    })
    .from(PurchaseTable)
    // groupBy: 지정된 컬럼으로 결과를 그룹화
    .groupBy((table) => table.isRefund);

  // 환불되지 않은 데이터만 필터링 (정상 판매 데이터)
  const [salesData] = data.filter((row) => !row.isRefund);
  // 환불된 데이터만 필터링
  const [refundData] = data.filter((row) => row.isRefund);

  // 순매출액 (환불되지 않은 총 구매 금액)
  const netSales = salesData?.totalPurchases ?? 0;
  // 총 환불액
  const totalRefunds = refundData?.totalSales ?? 0;
  // 순구매 건수 (환불되지 않은 구매 건수)
  const netPurchases = salesData?.totalPurchases ?? 0;
  // 환불된 구매 건수
  const refundedPurchases = refundData?.totalPurchases ?? 0;
  // 고객당 평균 구매 건수 계산
  // null 체크와 0으로 나누는 것을 방지
  const averageNetPurchasePerCustomer =
    salesData?.totalUsers != null && salesData.totalUsers > 0
      ? netPurchases / salesData.totalUsers
      : 0;

  return {
    netSales,
    totalRefunds,
    netPurchases,
    refundedPurchases,
    averageNetPurchasePerCustomer,
  };
}

async function getTotalStudents() {
  "use cache";
  cacheTag(getUserCourseAccessGlobalTag());

  const [data] = await db
    .select({
      totalStudents: countDistinct(UserCourseAccessTable.userId),
    })
    .from(UserCourseAccessTable);

  if (data == null) return 0;

  return data.totalStudents;
}

async function getTotalCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  const [data] = await db
    .select({
      totalCourses: count(CourseTable.id),
    })
    .from(CourseTable);

  if (data == null) return 0;

  return data.totalCourses;
}

async function getTotalProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  const [data] = await db
    .select({
      totalProducts: count(ProductTable.id),
    })
    .from(ProductTable);

  if (data == null) return 0;

  return data.totalProducts;
}

async function getTotalLessons() {
  "use cache";
  cacheTag(getLessonGlobalTag());

  const [data] = await db
    .select({
      totalLessons: count(LessonTable.id),
    })
    .from(LessonTable);

  if (data == null) return 0;

  return data.totalLessons;
}

async function getTotalCourseSections() {
  "use cache";
  cacheTag(getCourseSectionGlobalTag());

  const [data] = await db
    .select({
      totalCourseSections: count(CourseSectionTable.id),
    })
    .from(CourseSectionTable);

  if (data == null) return 0;

  return data.totalCourseSections;
}
