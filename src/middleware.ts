import { NextRequest, NextResponse } from "next/server";
import { DRIFT_TOKEN } from "@/lib/identity";

/**
 * Drift has no accounts. A reader's only identity is an anonymous, httpOnly
 * `drift_token` cookie, minted here on first visit. It's set on the forwarded
 * request too, so the very first page render can already read it.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.get(DRIFT_TOKEN)?.value) {
    return NextResponse.next();
  }

  const token = crypto.randomUUID();
  request.cookies.set(DRIFT_TOKEN, token);

  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set({
    name: DRIFT_TOKEN,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
