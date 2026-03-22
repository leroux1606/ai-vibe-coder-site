import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Sets an HttpOnly session cookie so per-session rate limits can apply after the first response.
 * The value is not signed; for stricter abuse resistance, add an HMAC (server secret) later.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.get("dt_sid")) {
    return NextResponse.next();
  }
  const res = NextResponse.next();
  res.cookies.set("dt_sid", crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

// Only run on the document URL. Matching `/api/*` can break or alter API responses on some
// Next.js 16 setups; the session cookie is still set on the first page load before chat is used.
export const config = {
  matcher: ["/"],
};
