import { can, mapProjection, type AuthorizationProjection, type Capability } from "../../domain/authorization";
import type { BrowserCompanyContext } from "./company-context";

interface GuardDependencies {
  context: () => Promise<BrowserCompanyContext | null>;
  renew: (companyId: string) => Promise<boolean>;
  project: (companyId: string) => Promise<AuthorizationProjection | null>;
  clear: () => void;
}

/** Revalidates lifecycle and company authorization for every protected request. */
export async function requireCapability(requirement: Capability & { moduleKey?: string }, deps: GuardDependencies) {
  const context = await deps.context();
  if (!context) return { status: "context_required" as const };
  if (!(await deps.renew(context.companyId))) {
    deps.clear();
    return { status: "context_required" as const };
  }
  const projection = await deps.project(context.companyId);
  return projection && can(projection, requirement)
    ? { status: "ok" as const, projection }
    : { status: "forbidden" as const };
}

export { mapProjection };
