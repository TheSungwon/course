import { Button } from "@/components/ui/button";
import { canAccessAdminPages } from "@/permissions/general";
import { getCurrentUser } from "@/services/clerk";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode, Suspense } from "react";

export default function ConsumerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

function Navbar() {
  return (
    <header className="flex h-12 shadow bg-background z-10">
      <nav className="flex gap-4 container">
        <Link
          className="mr-auto text-lg hover:underline px-2 flex items-center"
          href="/"
        >
          Web
        </Link>
        <Suspense fallback={<div>Loading...</div>}>
          <SignedIn>
            <AdminLink />
            <Link
              className="hover:underline bg-accent/10 flex items-center"
              href="/courses"
            >
              My Course
            </Link>
            <Link
              className="hover:underline bg-accent/10 flex items-center px-2"
              href="/purchases"
            >
              Purchase History
            </Link>
            <div className="size-8 self-center">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: "100%",
                      height: "100%",
                    },
                  },
                }}
              />
            </div>
          </SignedIn>
          {/* 로그인 했을 때만 보임 */}
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <SignedOut>
            <Button className="self-center" asChild>
              <SignInButton>로그인</SignInButton>
            </Button>
          </SignedOut>
          {/* 로그인 안했을 때만 보임 */}
        </Suspense>
      </nav>
    </header>
  );
}

async function AdminLink() {
  const user = await getCurrentUser();
  if (!canAccessAdminPages(user)) return null;

  return (
    <Link className="hover:bg-accent/10 flex items-center px-2" href="/admin">
      Admin
    </Link>
  );
}
