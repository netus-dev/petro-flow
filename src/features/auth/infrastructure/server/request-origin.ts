/** Builds the trusted same-origin value without assuming HTTPS for local HTTP requests. */
export function expectedRequestOrigin(host: string | null, forwardedProto: string | null) {
  if (!host) return null;
  const normalizedHost = host.trim();
  const protocol = forwardedProto?.split(",", 1)[0]?.trim().toLowerCase()
    || (normalizedHost.startsWith("localhost:") || normalizedHost.startsWith("127.0.0.1:") ? "http" : "https");
  if (protocol !== "http" && protocol !== "https") return null;
  return `${protocol}://${normalizedHost}`;
}

/** Checks that a request origin matches the trusted host and forwarded protocol. */
export function isSameRequestOrigin(origin: string | null, host: string | null, forwardedProto: string | null) {
  return Boolean(origin && origin === expectedRequestOrigin(host, forwardedProto));
}

/** Keeps Secure unless a validated request is explicitly HTTP on a loopback host outside production. */
export function shouldUseSecureCookie(
  origin: string | null,
  host: string | null,
  forwardedProto: string | null,
  isProduction: boolean,
): boolean {
  if (isProduction || !origin || forwardedProto?.includes(",") || !isSameRequestOrigin(origin, host, forwardedProto)) return true;
  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.origin !== origin) return true;
    const isLoopback = parsedOrigin.hostname === "localhost"
      || parsedOrigin.hostname === "127.0.0.1"
      || parsedOrigin.hostname === "[::1]";
    return parsedOrigin.protocol !== "http:" || !isLoopback;
  } catch {
    return true;
  }
}
