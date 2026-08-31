"use client";

import { useEffect } from "react";
import { Skeleton } from "@/src/core/presentation/components/ui/skeleton";
import { useAccessControlError, useAccessControlLoading, useAccessControlAuditEvents, useRefreshAccessControl } from "@/src/features/access-control/presentation/access-control-store";

/** Tenant administration panel; global RBAC operations are intentionally absent. */
export function AccessControlPanel() {
  const audits = useAccessControlAuditEvents();
  const loading = useAccessControlLoading(); const error = useAccessControlError(); const refresh = useRefreshAccessControl();
  useEffect(() => { void refresh(); }, [refresh]);
  if (loading && !audits.length) return <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>;
  return <div className="space-y-6">
    {error && <p role="alert" className="rounded border border-destructive p-3 text-sm text-destructive">{error}</p>}
    <section className="rounded-lg border p-5"><h2 className="font-medium">Tenant administration</h2><p className="mt-1 text-sm text-muted-foreground">Role and company-global mutations are disabled until the schema has explicit company ownership.</p></section>
    <section className="rounded-lg border p-5"><h2 className="font-medium">Authorization audit</h2><p className="mt-1 text-sm text-muted-foreground">Immutable events are displayed newest first.</p><ul className="mt-4 space-y-2 text-sm">{audits.slice(0, 10).map((event) => <li key={event.id} className="flex justify-between border-b pb-2"><span>{event.eventType}</span><span>{event.outcome}</span></li>)}</ul></section>
  </div>;
}
