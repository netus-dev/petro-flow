/** Permissions used by the Hourmeters presentation boundary. */
export const HOUR_METER_PERMISSIONS = {
  access: "hourmeters.access",
  register: "hourmeters.register",
  inventory: "hourmeters.inventory.manage",
  maintenanceManage: "hourmeters.maintenance.manage",
} as const;

export type HourMeterPermission = typeof HOUR_METER_PERMISSIONS[keyof typeof HOUR_METER_PERMISSIONS];

export type PermissionRoleRow = {
  roles: { role_permissions: { permissions: { name: string } | null }[] } | null;
};

/** Extracts permission names from the nested authorization query result. */
export function extractPermissionNames(rows: readonly PermissionRoleRow[]): string[] {
  return rows.flatMap((row) =>
    row.roles?.role_permissions.map((item) => item.permissions?.name).filter((name): name is string => Boolean(name)) ?? [],
  );
}

/** Returns whether a user may perform the requested Hourmeters action. */
export function canUseHourMeterPermission(permissions: readonly string[], permission: HourMeterPermission): boolean {
  return permissions.includes(permission);
}
