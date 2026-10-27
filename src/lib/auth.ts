import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "sf_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
export const SESSION_REFRESH_THRESHOLD = 2 * 24 * 60 * 60; // 2 days in seconds

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn(
    "[SECURITY WARNING] process.env.JWT_SECRET is not set in production. Using a fallback secret is insecure!"
  );
}

export const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "synapseflow-super-secret-jwt-key-minimum-32-chars-long";
export const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  exp?: number;
}

/**
 * Checks whether an active session is within the refresh threshold (sliding window).
 */
export function shouldRefreshSession(expTimestamp?: number): boolean {
  if (!expTimestamp || typeof expTimestamp !== "number") {
    return false;
  }
  const currentEpochSeconds = Math.floor(Date.now() / 1000);
  const remainingSeconds = expTimestamp - currentEpochSeconds;
  return remainingSeconds > 0 && remainingSeconds <= SESSION_REFRESH_THRESHOLD;
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
