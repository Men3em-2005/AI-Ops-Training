import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { Role, SessionPayload } from "@/lib/types";

const SESSION_COOKIE = "session";

const ROLE_PREFIX: Record<Role, string> = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  STAFF: "/staff",
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

async function readSession(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSession(request);

  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(
        new URL(ROLE_PREFIX[session.role], request.url)
      );
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedPrefix = ROLE_PREFIX[session.role];
  const isOwnArea = pathname.startsWith(allowedPrefix);

  if (!isOwnArea) {
    return NextResponse.redirect(new URL(allowedPrefix, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
