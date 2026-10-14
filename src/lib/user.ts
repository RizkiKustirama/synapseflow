import { prisma } from "@/lib/prisma";

export const DEFAULT_USER_ID = "c0000000-0000-0000-0000-000000000001";

/**
 * Retrieve the current authenticated user ID.
 * In development / single-user mode, ensures the default user exists in the database.
 */
export async function getCurrentUserId(): Promise<string> {
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
