import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];

// Decode JWT payload without verifying signature (auth verification is done by Flask)
function decodePayload(token: string): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

type UserRole = "user" | "admin" | "superadmin";

const ROLE_LEVEL: Record<string, number> = {
  user: 1,
  admin: 2,
  superadmin: 3,
};

// Routes and their minimum required role
const PROTECTED_ROUTES: { prefix: string; minRole: UserRole }[] = [
  { prefix: "/admin", minRole: "admin" },
  { prefix: "/detector", minRole: "admin" },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/flask")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  // No token → redirect to login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Decode role for route protection
  const payload = decodePayload(token);
  const userRole = payload?.role || "user";
  const userLevel = ROLE_LEVEL[userRole] ?? 1;

  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route.prefix)) {
      const requiredLevel = ROLE_LEVEL[route.minRole] ?? 1;
      if (userLevel < requiredLevel) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
