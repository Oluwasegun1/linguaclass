import {
  createServerClient,
  parseCookieHeader,
} from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { decodeSupabaseJWT } from "./verify-jwt";

/**
 * Refreshes the Supabase session on every request and propagates updated
 * auth cookies onto both the forwarded request and the outgoing response.
 *
 * Auth strategy (two-tier):
 *   1. Fast path — decode the session cookie JWT locally (no network call).
 *      Used to determine user presence for redirect logic.
 *   2. Session refresh — call createServerClient + getUser() to refresh the
 *      token if it's expiring. Supabase SSR handles cookie rotation.
 *
 * Server-only env vars used (SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY) —
 * these are never prefixed with NEXT_PUBLIC_ and never shipped to the browser.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: getUser() validates the token with Supabase Auth and refreshes
  // the session cookie if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that unauthenticated users can access
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/auth");

  // Redirect unauthenticated users trying to access protected routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Fast-path role segregation for authenticated users
  if (user) {
    const role = user.user_metadata?.role as string | undefined;
    if (role === "TEACHER" && pathname.startsWith("/student")) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
    if (role === "STUDENT" && pathname.startsWith("/teacher")) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

/**
 * Fast, network-free check for whether a request has a valid Supabase session.
 * Decodes the JWT from cookies without verifying the signature.
 */
export function peekSessionUser(
  request: NextRequest,
): { id: string; email?: string; role?: string } | null {
  const cookies = parseCookieHeader(request.headers.get("cookie") ?? "");
  const authCookie = cookies.find(({ name }) => name.includes("auth-token"));
  if (!authCookie) return null;

  try {
    const raw = decodeURIComponent(authCookie.value);
    const parsed = raw.startsWith("[") ? (JSON.parse(raw) as string[])[0] : raw;
    if (!parsed) return null;

    const payload = decodeSupabaseJWT(parsed);
    if (!payload?.sub) return null;

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
