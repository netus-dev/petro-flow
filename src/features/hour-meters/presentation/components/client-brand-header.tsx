"use client";

import { useClientBranding } from "../hooks/use-client-branding";

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

/** Shows the current client's logo or an accessible initials placeholder. */
export function ClientBrandHeader() {
  const branding = useClientBranding();
  if (!branding) return <div aria-hidden="true" className="h-14 w-40 animate-pulse rounded-xl bg-muted" />;

  return <div className="flex items-center gap-3">
    <div className="flex h-14 w-40 items-center justify-center overflow-hidden rounded-xl border bg-muted text-lg font-semibold text-primary">
      {branding.logoUrl ? <img src={branding.logoUrl} alt={`Logotipo de ${branding.clientName}`} className="h-full w-full object-contain" /> : <span aria-label={`Identificador visual de ${branding.clientName}`}>{getInitials(branding.clientName)}</span>}
    </div>
    <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Cliente actual</p><p className="font-semibold">{branding.clientName}</p></div>
  </div>;
}
