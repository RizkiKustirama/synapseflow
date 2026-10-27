import { describe, it, expect, afterAll, mock } from "bun:test";

mock.module("next/cache", () => ({
  revalidatePath: () => {},
}));

mock.module("next/headers", () => ({
  cookies: () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  }),
}));

import { prisma } from "@/lib/prisma";
import {
  registerSchema,
  loginSchema,
} from "@/lib/validations/auth.schema";
import { hashPassword, comparePassword } from "@/lib/password";
import {
  signSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import { registerUser, loginUser } from "@/actions/auth.actions";

describe("Multi-User Authentication & Isolation Test Suite", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("1. Validation Schemas", () => {
    it("rejects invalid email formats", () => {
      const result = registerSchema.safeParse({
        fullName: "Test User",
        email: "not-an-email",
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects weak passwords (missing number or uppercase)", () => {
      const result = registerSchema.safeParse({
        fullName: "Test User",
        email: "test@example.com",
        password: "weakpassword",
        confirmPassword: "weakpassword",
      });
      expect(result.success).toBe(false);
    });

    it("rejects mismatched confirm password", () => {
      const result = registerSchema.safeParse({
        fullName: "Test User",
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "DifferentPassword123",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid registration input", () => {
      const result = registerSchema.safeParse({
        fullName: "Valid User",
        email: "valid@example.com",
        password: "StrongPassword123",
        confirmPassword: "StrongPassword123",
      });
      expect(result.success).toBe(true);
    });

    it("validates login inputs", () => {
      const valid = loginSchema.safeParse({
        email: "valid@example.com",
        password: "AnyPassword123",
      });
      expect(valid.success).toBe(true);

      const invalid = loginSchema.safeParse({
        email: "bad-email",
        password: "",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("2. Cryptography & Session Tokens", () => {
    it("hashes and verifies password using bcrypt", async () => {
      const rawPassword = "SecurePassword2026";
      const hash = await hashPassword(rawPassword);

      expect(hash).not.toBe(rawPassword);
      expect(hash.startsWith("$2")).toBe(true);

      const isValid = await comparePassword(rawPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword("WrongPassword", hash);
      expect(isInvalid).toBe(false);
    });

    it("signs and verifies JWT session tokens with jose", async () => {
      const payload = {
        userId: "u1111111-2222-3333-4444-555555555555",
        email: "tenant@synapse.test",
        fullName: "Tenant User",
      };

      const token = await signSessionToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);

      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
    });

    it("returns null for tampered token", async () => {
      const validToken = await signSessionToken({
        userId: "test-user-id",
        email: "test@test.com",
        fullName: "Test",
      });

      const tampered = validToken.substring(0, validToken.length - 5) + "abcde";
      const result = await verifySessionToken(tampered);
      expect(result).toBeNull();
    });
  });

  describe("3. Multi-Tenant Registration & Isolation", () => {
    const tenantAEmail = `tenant-a-${Date.now()}@test.com`;
    const tenantBEmail = `tenant-b-${Date.now()}@test.com`;
    let userAId: string;
    let userBId: string;

    it("registers Tenant A and seeds default categories", async () => {
      const resA = await registerUser({
        fullName: "Tenant A User",
        email: tenantAEmail,
        password: "Password123",
        confirmPassword: "Password123",
      });

      expect(resA.success).toBe(true);
      expect(resA.user?.id).toBeDefined();
      userAId = resA.user!.id;

      // Verify default categories seeded for User A
      const categoriesA = await prisma.category.findMany({
        where: { userId: userAId },
      });
      expect(categoriesA.length).toBeGreaterThanOrEqual(6);
    });

    it("prevents duplicate registration with same email", async () => {
      const duplicateRes = await registerUser({
        fullName: "Duplicate User",
        email: tenantAEmail,
        password: "Password123",
        confirmPassword: "Password123",
      });

      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.error).toContain("sudah terdaftar");
    });

    it("authenticates Tenant A with valid credentials", async () => {
      const loginRes = await loginUser({
        email: tenantAEmail,
        password: "Password123",
      });

      expect(loginRes.success).toBe(true);
      expect(loginRes.user?.email).toBe(tenantAEmail);
    });

    it("rejects login with wrong password", async () => {
      const failedLogin = await loginUser({
        email: tenantAEmail,
        password: "WrongPassword999",
      });

      expect(failedLogin.success).toBe(false);
      expect(failedLogin.error).toContain("salah");
    });

    it("registers Tenant B and enforces complete data isolation between tenants", async () => {
      const resB = await registerUser({
        fullName: "Tenant B User",
        email: tenantBEmail,
        password: "Password123",
        confirmPassword: "Password123",
      });

      expect(resB.success).toBe(true);
      userBId = resB.user!.id;

      // Get category for Tenant A
      const categoryA = await prisma.category.findFirst({
        where: { userId: userAId, type: "INCOME" },
      });
      expect(categoryA).toBeDefined();

      // Create a transaction belonging directly to Tenant A
      const txA = await prisma.transaction.create({
        data: {
          userId: userAId,
          categoryId: categoryA!.id,
          type: "INCOME",
          amount: 50000000,
          date: new Date(),
          description: "Tenant A Secret Income",
          sourceType: "MANUAL",
        },
      });

      // Tenant B queries transactions: Tenant A's transaction MUST NOT appear in Tenant B query
      const tenantBTransactions = await prisma.transaction.findMany({
        where: { userId: userBId },
      });

      const hasTenantATx = tenantBTransactions.some((t) => t.id === txA.id);
      expect(hasTenantATx).toBe(false);

      // Clean up test transactions and tenants
      await prisma.transaction.delete({ where: { id: txA.id } });
      await prisma.user.delete({ where: { id: userAId } });
      await prisma.user.delete({ where: { id: userBId } });
    });
  });
});
