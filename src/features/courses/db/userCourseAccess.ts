import { db } from "@/drizzle/db";
import {
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { revalidateUserCourseAccessCache } from "./cache/userCourseAccess";
import { and, eq, inArray, isNull } from "drizzle-orm";

//({userId: user.id, courseIds});
export async function addUserCourseAccess(
  {
    userId,
    courseIds,
  }: {
    userId: string;
    courseIds: string[];
  },
  trx: Omit<typeof db, "$client"> = db
) {
  const accesses = await trx
    .insert(UserCourseAccessTable)
    .values(courseIds.map((courseId) => ({ userId, courseId })))
    .onConflictDoNothing()
    .returning();

  accesses.forEach(revalidateUserCourseAccessCache);

  return accesses;
}

// revokeUserCourseAccess 함수: 사용자의 코스 접근 권한을 철회하는 함수
export async function revokeUserCourseAccess(
  {
    userId, // 사용자의 고유 ID
    productId, // 제품의 고유 ID
  }: {
    userId: string;
    productId: string;
  },
  trx: Omit<typeof db, "$client"> = db // 데이터베이스 트랜잭션 혹은 기본 db 객체
) {
  // 사용자의 환불되지 않은 유효 구매 기록들을 조회
  const validPurchases = await trx.query.PurchaseTable.findMany({
    where: and(
      eq(PurchaseTable.userId, userId), // 구매 기록의 사용자 ID가 일치하는지 체크
      isNull(PurchaseTable.refundedAt) // 구매가 아직 환불되지 않았는지 확인
    ),

    // 각 구매에 연결된 제품 정보를 가져옴 (제품에 연결된 코스 정보 포함)
    with: {
      product: {
        with: {
          courseProducts: {
            columns: {
              courseId: true, // 코스 ID만 선택
            },
          },
        },
      },
    },
  });

  // 제품 정보를 조회 (환불 대상 제품으로, 코스 정보 포함)
  const refundPurchase = await trx.query.ProductTable.findFirst({
    where: eq(ProductTable.id, productId), // 제품 ID가 일치하는지 체크
    with: {
      courseProducts: {
        columns: {
          courseId: true, // 코스 ID만 선택
        },
      },
    },
  });

  // 환불 대상 제품 정보가 없으면 종료
  if (refundPurchase == null) {
    return;
  }

  // 유효 구매 기록에서 연결된 모든 코스 ID들을 추출
  const validCourseIds = validPurchases.flatMap((p) =>
    p.product.courseProducts.map((cp) => cp.courseId)
  );

  // 환불 대상 제품에 연결된 코스 중, 유효 구매에 포함되지 않는 코스 ID들을 선택
  const removeCourseIds = refundPurchase.courseProducts
    .flatMap((cp) => cp.courseId)
    .filter((courseId) => !validCourseIds.includes(courseId));

  // 사용자에 대해 선택된 코스 접근 권한을 데이터베이스에서 삭제
  const revokedAccesses = await trx
    .delete(UserCourseAccessTable)
    .where(
      and(
        eq(UserCourseAccessTable.userId, userId), // 사용자 ID가 일치하는지 확인
        inArray(UserCourseAccessTable.courseId, removeCourseIds) // 삭제 대상 코스 여부 확인
      )
    )
    .returning(); // 삭제된 접근 권한 정보를 반환

  // 삭제된 각 접근 권한에 대해 캐시를 무효화 처리
  revokedAccesses.forEach(revalidateUserCourseAccessCache);

  // 삭제된 접근 권한 정보를 반환
  return revokedAccesses;
}
