import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const sessionCookieName = "next-auth.session-token-dashboard";

function getJwtExpiry(token?: unknown) {
  if (typeof token !== "string") {
    return null;
  }

  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(base64));
    return typeof decodedPayload.exp === "number" ? decodedPayload.exp : null;
  } catch {
    return null;
  }
}

function redirectToSignIn(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/signin", request.url));
  response.cookies.delete(sessionCookieName);
  return response;
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: sessionCookieName,
  });

  const { pathname } = request.nextUrl;
  const accessTokenExpiry = getJwtExpiry(token?.accessToken);
  const isAccessTokenExpired =
    accessTokenExpiry !== null && accessTokenExpiry * 1000 <= Date.now();

  if ((!token || isAccessTokenExpired) && pathname !== "/signin") {
    return redirectToSignIn(request);
  }

  if (token && !isAccessTokenExpired && pathname === "/signin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
