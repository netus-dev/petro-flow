/**
 * Resolves a safe internal destination after login.
 *
 * @param redirectTo - Requested return path from the login query string.
 * @returns The requested internal path or the dashboard fallback.
 */
export function getValidRedirectPath(redirectTo: string | null): string {
  if (
    redirectTo &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//") &&
    !redirectTo.startsWith("/auth") &&
    redirectTo !== "/select-company"
  ) {
    return redirectTo;
  }

  return "/dashboard";
}
