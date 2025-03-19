import { pppCoupons } from "@/data/pppCoupons";
import { headers } from "next/headers";

async function getUserCountry() {
  const head = await headers();
  // console.log([...head.entries()], "head");
  return head.get("cf-ipcountry");
}
export async function getUserCoupon() {
  // const country = await getUserCountry();
  const country = "AF";

  if (country == null) return;

  const coupon = pppCoupons.find((coupon) =>
    coupon.countryCodes.includes(country)
  );

  if (coupon == null) return;

  return {
    stripeCouponId: coupon.stripeCouponId,
    discountPercentage: coupon.discountPercentage,
  };
}
