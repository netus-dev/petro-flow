export interface Capability { action: string; resource: string }
export interface AuthorizationProjection {
  userId: string;
  activeCompanyId: string;
  roles: string[];
  capabilities: Capability[];
  enabledModules: string[];
}

interface ProjectionDto {
  user_id: string;
  company_id: string;
  roles?: string[];
  capabilities?: Capability[];
  enabled_modules?: string[];
}

/** Maps the database projection without accepting client-asserted authorization. */
export function mapProjection(dto: ProjectionDto): AuthorizationProjection {
  return {
    userId: dto.user_id,
    activeCompanyId: dto.company_id,
    roles: dto.roles ?? [],
    capabilities: dto.capabilities ?? [],
    enabledModules: dto.enabled_modules ?? [],
  };
}

/** Evaluates an action/resource pair inside an optional enabled module. */
export function can(
  projection: Pick<AuthorizationProjection, "capabilities" | "enabledModules">,
  requirement: Capability & { moduleKey?: string },
) {
  return (!requirement.moduleKey || projection.enabledModules.includes(requirement.moduleKey))
    && projection.capabilities.some(({ action, resource }) => action === requirement.action && resource === requirement.resource);
}
