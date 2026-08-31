/**
 * Returns the secret used to sign the browser company-context cookie.
 *
 * @throws {Error} when the server secret is missing or blank.
 */
export function getAuthorizationContextSecret(): string {
  const value = process.env.AUTHORIZATION_CONTEXT_SECRET?.trim();
  if (!value) {
    throw new Error(
      "AUTHORIZATION_CONTEXT_SECRET is missing. Add a non-empty random value to .env.local and restart the Next.js server.",
    );
  }
  return value;
}
