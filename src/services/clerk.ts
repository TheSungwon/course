import { UserRole } from "@/drizzle/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient();

export async function getCurrentUser() {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  //   console.log("getCurrentUser", userId, sessionClaims, redirectToSignIn);

  return {
    clerkUserId: userId,
    role: sessionClaims?.role,
    redirectToSignIn,
  };
}

export async function syncClerkUserMetadata(user: {
  id: string;
  clerkUserId: string;
  role: UserRole;
}) {
  return client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      dbId: user.id,
      role: user.role,
    },
  });
}
