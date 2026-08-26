import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/src/core/lib/supabase/middleware";
import { COMPANY_CONTEXT_COOKIE } from "@/src/features/authorization/infrastructure/server/company-context";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/auth");

  // Case 1: Unauthenticated or expired session attempting to access protected routes
  if (!user && !isAuthRoute) {
    supabaseResponse.cookies?.delete?.(COMPANY_CONTEXT_COOKIE);
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Case 2: Authenticated user attempting to access public auth routes (/auth/*)
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("redirectTo");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (.svg, .png, .jpg, .ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)",
  ],
};
