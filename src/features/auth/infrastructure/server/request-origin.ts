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
