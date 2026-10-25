import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  JWT_SECRET,
  shouldRefreshSession,
  SessionPayload,
} from "@/lib/auth";
import { getSafeRedirectUrl } from "@/lib/security";

// Paths accessible without authentication
const PUBLIC_PATHS = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/logo") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;
  let refreshedToken: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload && payload.userId) {
        isAuthenticated = true;

        // Sliding Session: Auto-refresh JWT if expiration is within 2 days
        if (payload.exp && shouldRefreshSession(payload.exp)) {
          const newSessionPayload: SessionPayload = {
            userId: payload.userId as string,
            email: (payload.email as string) || "",
            fullName: (payload.fullName as string) || "",
          };

          refreshedToken = await new SignJWT({ ...newSessionPayload })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(JWT_SECRET);
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path);

  // 1. Unauthenticated user trying to access protected route -> redirect to /login
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", getSafeRedirectUrl(pathname));
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user trying to access /login or /register -> redirect to dashboard
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Authenticated request - attach refreshed cookie if sliding window was triggered
  const response = NextResponse.next();
  if (refreshedToken) {
    response.cookies.set({
      name: COOKIE_NAME,
      value: refreshedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
