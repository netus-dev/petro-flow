import { mapProjection, type AuthorizationProjection } from "../domain/authorization";

interface SwitchDependencies {
  origin: string;
  project: (companyId: string) => Promise<Parameters<typeof mapProjection>[0] | null>;
  write: (companyId: string) => void;
  invalidate: () => void;
}

/** Validates same-origin selection and changes context only after membership projection succeeds. */
export async function switchCompany(companyId: string, requestOrigin: string | null, deps: SwitchDependencies) {
  if (requestOrigin !== deps.origin) return { status: "forbidden" as const };
  const dto = await deps.project(companyId);
  if (!dto) return { status: "forbidden" as const };
  const projection: AuthorizationProjection = mapProjection(dto);
  deps.invalidate();
  deps.write(companyId);
  return { status: "ok" as const, projection };
}
