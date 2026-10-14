import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const COOKIE_NAME = "sf_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

const JWT_SECRET_STRING = process.env.JWT_SECRET || "synapseflow-super-secret-jwt-key-minimum-32-chars-long";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
}

/**
 * Hash plain password using bcrypt with salt rounds 10
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare plain password against stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT session token using jose
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify JWT session token and return decoded payload
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId || typeof payload.userId !== "string") {
      return null;
    }
    return {
      userId: payload.userId as string,
      email: (payload.email as string) || "",
      fullName: (payload.fullName as string) || "",
    };
  } catch {
    return null;
  }
}
