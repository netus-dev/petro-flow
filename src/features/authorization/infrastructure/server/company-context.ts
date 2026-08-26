import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const COMPANY_CONTEXT_COOKIE = "petro_company_context";
export const companyContextCookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

export interface BrowserCompanyContext { companyId: string; contextId: string; issuedAt: number }

/** Creates an opaque signed browser-session company context. */
export function sealCompanyContext(context: BrowserCompanyContext, secret: string) {
  const payload = Buffer.from(JSON.stringify(context)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return { value: `${payload}.${signature}`, options: companyContextCookieOptions };
}

/** Verifies and decodes a company context without treating it as authority. */
export function readCompanyContext(value: string | undefined, secret: string): BrowserCompanyContext | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const context = JSON.parse(Buffer.from(payload, "base64url").toString()) as BrowserCompanyContext;
    return context.companyId && context.contextId && Number.isFinite(context.issuedAt) ? context : null;
  } catch { return null; }
}

export function newCompanyContext(companyId: string): BrowserCompanyContext {
  return { companyId, contextId: randomUUID(), issuedAt: Date.now() };
}
