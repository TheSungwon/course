"use server";

import { stripeServerClient } from "@/services/stripe/stripeServer";
import { canRefundPurchases } from "../../permissions/purchases";
import { getCurrentUser } from "@/services/clerk";
import { db } from "@/drizzle/db";
import { updatePurchase } from "../purchases"; // 구매 기록 업데이트 함수 (환불 시 업데이트) import
import { revokeUserCourseAccess } from "@/features/courses/db/userCourseAccess"; // 사용자의 코스 접근 권한 철회 함수 import

export async function refundPurchase(id: string) {
  // 환불 처리를 위한 비동기 함수 정의, 구매 id를 매개변수로 받음
  if (!canRefundPurchases(await getCurrentUser())) {
    // 현재 사용자가 환불 권한(관리자 권한)이 있는지 확인
    return { error: true, message: "관리자만 환불 가능합니다." }; // 권한 없을 경우 에러 메시지 반환
  }

  const data = await db.transaction(async (trx) => {
    // 데이터베이스 트랜잭션 시작, trx는 트랜잭션 객체
    const refundedPurchase = await updatePurchase(
      // 환불 처리 진행: 구매 기록 업데이트 (환불 시각 기록)
      id, // 업데이트할 구매의 id
      { refundedAt: new Date() }, // 환불 시각을 현재 시각으로 설정
      trx // 트랜잭션 객체 전달
    );

    const session = await stripeServerClient.checkout.sessions.retrieve(
      // Stripe Checkout 세션 정보 조회
      refundedPurchase.stripeSessionId // 구매 기록에 있는 Stripe 세션 ID 사용
    );

    if (session.payment_intent == null) {
      // 해당 세션에 payment_intent (결제 정보)가 없을 경우
      trx.rollback(); // 트랜잭션 롤백
      return { error: true, message: "결제 정보가 없습니다." }; // 에러 메시지 반환
    }

    try {
      await stripeServerClient.refunds.create({
        // Stripe 환불 생성 요청
        payment_intent:
          typeof session.payment_intent === "string" // payment_intent 타입이 문자열이면
            ? session.payment_intent // 문자열 그대로 사용
            : session.payment_intent.id, // 객체이면 id 값 사용
      });

      await revokeUserCourseAccess(refundedPurchase, trx); // 환불된 구매 정보를 이용해 사용자 코스 접근 권한 철회
    } catch {
      // 환불 요청 및 코스 접근 철회 처리 중 에러 발생 시
      trx.rollback(); // 트랜잭션 롤백
      return { error: true, message: "환불에 실패했습니다." }; // 에러 메시지 반환
    }
  });

  return data ?? { error: false, message: "환불 되었습니다." }; // 트랜잭션 결과 반환, 결과가 없으면 성공 메시지 반환
}
