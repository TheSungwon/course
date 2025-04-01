"use server";

import { stripeServerClient } from "@/services/stripe/stripeServer";
import { canRefundPurchases } from "../../permissions/purchases";
import { getCurrentUser } from "@/services/clerk";
import { db } from "@/drizzle/db";
import { updatePurchase } from "../purchases";
import { revokeUserCourseAccess } from "@/features/courses/db/userCourseAccess";

export async function refundPurchase(id: string) {
  if (!canRefundPurchases(await getCurrentUser())) {
    return { error: true, message: "관리자만 환불 가능합니다." };
  }

  const data = await db.transaction(async (trx) => {
    const refundedPurchase = await updatePurchase(
      id,
      { refundedAt: new Date() },
      trx
    );

    const session = await stripeServerClient.checkout.sessions.retrieve(
      refundedPurchase.stripeSessionId
    );

    if (session.payment_intent == null) {
      trx.rollback();
      return { error: true, message: "결제 정보가 없습니다." };
    }

    try {
      await stripeServerClient.refunds.create({
        payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id,
      });

      await revokeUserCourseAccess(refundedPurchase, trx);
    } catch {
      trx.rollback();
      return { error: true, message: "환불에 실패했습니다." };
    }
  });

  return data ?? { error: false, message: "환불 되었습니다." };
}
