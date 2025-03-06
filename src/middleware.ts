import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  // 사용자 인증 정보 확인
  const { userId } = await auth();
  // const { pathname } = new URL(req.url);

  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api(.*)",
    "/courses/:courseId/lessons/:lessonId",
    "/products(.*)",
  ]);
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  if (!userId) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/admin(.*)", // admin 경로 추가
  ],
};
