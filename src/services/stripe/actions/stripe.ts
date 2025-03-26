"use server";
import { getUserCoupon } from "@/lib/userCountryHeader";
import { stripeServerClient } from "../stripeServer";
import { env } from "@/data/env/client";

export async function getClientSessionSecret(
  product: {
    priceInDollars: number;
    name: string;
    imageUrl: string;
    description: string;
    id: string;
  },
  user: {
    email: string;
    id: string;
  }
) {
  // 사용자의 쿠폰 정보를 비동기로 가져옵니다.
  const coupon = await getUserCoupon();

  // 쿠폰이 존재하는 경우, Stripe에서 요구하는 형식의 할인 배열을 생성하고,
  // 쿠폰이 없으면 discounts를 undefined로 설정합니다.
  const discounts = coupon
    ? [
        {
          // coupon 객체 내의 stripeCouponId를 사용하여 할인 쿠폰을 설정합니다.
          coupon: coupon.stripeCouponId,
        },
      ]
    : undefined;

  // Stripe Checkout 세션을 생성하여 결제 처리를 준비합니다.
  const session = await stripeServerClient.checkout.sessions.create({
    // 구매할 상품에 대한 정보를 배열로 전달합니다.
    line_items: [
      {
        // 상품의 수량을 1로 설정합니다.
        quantity: 1,
        price_data: {
          // 결제 통화를 미국 달러(USD)로 설정합니다.
          currency: "krw",
          product_data: {
            // 상품의 이름을 지정합니다.
            name: product.name,
            // 상품 이미지의 URL을 절대경로로 변환하여 지정합니다.
            images: [
              new URL(product.imageUrl, env.NEXT_PUBLIC_SERVER_URL).href,
            ],
            // 상품 설명을 포함합니다.
            description: product.description,
          },
          // Stripe에서는 단위 금액이 센트 단위이므로, 달러 단위를 센트로 변환합니다.
          unit_amount: product.priceInDollars,
          // unit_amount: product.priceInDollars * 100, USD일때 적용
        },
      },
    ],
    // 내장형 UI 모드를 사용합니다.
    ui_mode: "embedded",
    // 결제 모드를 한 번의 결제로 설정합니다.
    mode: "payment",
    // 결제 완료 후 리디렉션될 URL을 설정합니다.
    return_url: `${env.NEXT_PUBLIC_SERVER_URL}/api/webhooks/stripe?stripeSessionId={CHECKOUT_SESSION_ID}`,
    // 고객의 이메일 주소를 지정하여 결제 세션에 연결합니다.
    customer_email: user.email,
    payment_intent_data: {
      // 결제 영수증을 받을 이메일 주소를 지정합니다.
      receipt_email: user.email,
    },
    // 앞서 설정한 할인 정보를 포함합니다.
    discounts,
    metadata: {
      // 추가 메타데이터로 상품 ID와 사용자 ID를 전달합니다.
      productId: product.id,
      userId: user.id,
    },
  });

  // Checkout 세션 생성 후, client_secret이 유효한지 확인합니다.
  if (session.client_secret == null) throw new Error("client secret is null");

  // 유효한 client_secret을 반환하여 클라이언트에서 결제 처리를 진행할 수 있도록 합니다.
  return session.client_secret;
}
