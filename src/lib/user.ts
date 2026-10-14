import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const DEFAULT_USER_ID = "c0000000-0000-0000-0000-000000000001";

/**
 * Retrieve the current authenticated user ID dynamically from session cookie.
 * Supports test environment fallback when executed without HTTP request context.
 */
export async function getCurrentUserId(): Promise<string> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      const payload = await verifySessionToken(token);
      if (payload?.userId) {
        return payload.userId;
      }
    }
  } catch {
    // If cookies() is called outside request scope (e.g. CLI or test scripts)
  }

  // Fallback for automated tests and initialization scripts
  await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      email: "user@synapseflow.app",
      fullName: "Alex Pratama",
      currency: "IDR",
    },
  });

  return DEFAULT_USER_ID;
}
