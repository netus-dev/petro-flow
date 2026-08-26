"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Skeleton } from "@/src/core/presentation/components/ui/skeleton";
import { useAccessControlCompanies, useAccessControlError, useAccessControlLoading, useAccessControlRoles, useAccessControlAuditEvents, useExecuteAccessControl, useRefreshAccessControl } from "@/src/features/access-control/presentation/access-control-store";

/** Interactive global administration panel; all persistence crosses a server action. */
export function AccessControlPanel() {
  const roles = useAccessControlRoles(); const companies = useAccessControlCompanies(); const audits = useAccessControlAuditEvents();
  const loading = useAccessControlLoading(); const error = useAccessControlError(); const refresh = useRefreshAccessControl(); const execute = useExecuteAccessControl();
  const [roleName, setRoleName] = useState(""); const [companyName, setCompanyName] = useState("");
  useEffect(() => { void refresh(); }, [refresh]);
  if (loading && !roles.length && !companies.length) return <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>;
  return <div className="space-y-6">
    {error && <p role="alert" className="rounded border border-destructive p-3 text-sm text-destructive">{error}</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-lg border p-5"><h2 className="font-medium">Global roles</h2><form className="mt-4 flex gap-2" onSubmit={async (event) => { event.preventDefault(); if (roleName) { await execute({ type: "create-role", role: { name: roleName } }); setRoleName(""); } }}><Input aria-label="Role name" value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder="Role name" /><Button type="submit">Add</Button></form><ul className="mt-4 space-y-2 text-sm">{roles.map((role) => <li className="flex justify-between" key={role.id}><span>{role.name}</span><Button variant="ghost" size="sm" onClick={() => void execute({ type: "delete-role", roleId: role.id })}>Delete</Button></li>)}</ul></section>
      <section className="rounded-lg border p-5"><h2 className="font-medium">Companies</h2><form className="mt-4 flex gap-2" onSubmit={async (event) => { event.preventDefault(); if (companyName) { await execute({ type: "create-company", company: { name: companyName } }); setCompanyName(""); } }}><Input aria-label="Company name" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" /><Button type="submit">Add</Button></form><ul className="mt-4 space-y-2 text-sm">{companies.map((company) => <li className="flex justify-between" key={company.id}><span>{company.name} {company.isActive ? "(active)" : "(revoked)"}</span><Button variant="ghost" size="sm" onClick={() => void execute({ type: "set-company", companyId: company.id, isActive: !company.isActive })}>{company.isActive ? "Deactivate" : "Activate"}</Button></li>)}</ul></section>
    </div>
    <section className="rounded-lg border p-5"><h2 className="font-medium">Authorization audit</h2><p className="mt-1 text-sm text-muted-foreground">Immutable events are displayed newest first.</p><ul className="mt-4 space-y-2 text-sm">{audits.slice(0, 10).map((event) => <li key={event.id} className="flex justify-between border-b pb-2"><span>{event.eventType}</span><span>{event.outcome}</span></li>)}</ul></section>
  </div>;
}
