import { can, type AuthorizationProjection, type Capability } from "../../../../features/authorization/domain/authorization";

export interface AuthorizedNavigationItem {
  href: string;
  moduleKey?: string;
  capability: Capability;
}

/** Removes inaccessible navigation before active-route evaluation. */
export function filterNavigation<T extends AuthorizedNavigationItem>(
  items: T[],
  projection: Pick<AuthorizationProjection, "capabilities" | "enabledModules">,
  pathname: string,
) {
  return items
    .filter((item) => can(projection, { ...item.capability, moduleKey: item.moduleKey }))
    .map((item) => ({ ...item, active: pathname === item.href || pathname.startsWith(`${item.href}/`) }));
}
