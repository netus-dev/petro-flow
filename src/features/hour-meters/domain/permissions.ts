export const HOUR_METERS_MODULE = "hour-meters";

/** Canonical capabilities enforced by the deployed Hour Meters RLS policies. */
export const HOUR_METER_CAPABILITIES = {
  read: { action: "read", resource: "hour-meters" },
  register: { action: "register", resource: "hour-meters" },
  update: { action: "update", resource: "hour-meters" },
  manage: { action: "manage", resource: "hour-meters" },
} as const;

export type HourMeterCapability = typeof HOUR_METER_CAPABILITIES[keyof typeof HOUR_METER_CAPABILITIES];

export type HourMeterAuthorization = {
  capabilities: readonly { action: string; resource: string }[];
  enabledModules: readonly string[];
};

/** Evaluates the same action/resource/module triple used by RLS. */
export function canUseHourMeterCapability(authorization: HourMeterAuthorization, capability: HourMeterCapability): boolean {
  return authorization.enabledModules.includes(HOUR_METERS_MODULE)
    && authorization.capabilities.some(({ action, resource }) => action === capability.action && resource === capability.resource);
}
