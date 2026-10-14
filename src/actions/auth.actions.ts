"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  registerSchema,
  loginSchema,
  RegisterFormInput,
  LoginFormInput,
} from "@/lib/validations/auth.schema";
import {
  hashPassword,
  comparePassword,
  signSessionToken,
  verifySessionToken,
  COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { ensureDefaultCategories } from "@/actions/money.actions";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  currency?: string;
}

/**
 * Register a new user and initialize tenant state
 */
export async function registerUser(formData: RegisterFormInput) {
  const validated = registerSchema.parse(formData);

  // Check if email is already registered
  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existingUser) {
    return {
      success: false,
      error: "Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk.",
    };
  }

  // Hash password with bcrypt
  const passwordHash = await hashPassword(validated.password);

  // Create isolated user record in PostgreSQL
  const user = await prisma.user.create({
    data: {
      email: validated.email,
      fullName: validated.fullName,
      passwordHash,
      currency: "IDR",
    },
  });

  // Seed default starter categories for new tenant
  await ensureDefaultCategories(user.id);

  // Generate JWT session token
  const token = await signSessionToken({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
  });

  // Set HTTP-only secure session cookie
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  revalidatePath("/", "layout");
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
  };
}

/**
 * Authenticate user with email and password
 */
export async function loginUser(formData: LoginFormInput) {
  const validated = loginSchema.parse(formData);

  const user = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (!user || !user.passwordHash) {
    return {
      success: false,
      error: "Email atau password yang Anda masukkan salah.",
    };
  }

  const isPasswordValid = await comparePassword(
    validated.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    return {
      success: false,
      error: "Email atau password yang Anda masukkan salah.",
    };
  }

  // Ensure default categories exist
  await ensureDefaultCategories(user.id);

  // Generate JWT session token
  const token = await signSessionToken({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
  });

  // Set HTTP-only secure session cookie
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  revalidatePath("/", "layout");
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
  };
}

/**
 * Log out user and clear session cookie
 */
export async function logoutUser() {
  cookies().delete(COOKIE_NAME);
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Retrieve current authenticated user profile
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        currency: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
