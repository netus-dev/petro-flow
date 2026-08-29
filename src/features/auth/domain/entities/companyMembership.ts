export interface CompanyMembership {
  companyId: string;
  companyName: string;
}

export function resolveCompanySelection(memberships: CompanyMembership[], selectedCompanyId?: string) {
  if (memberships.length === 1) return { status: "selected" as const, companyId: memberships[0].companyId };
  if (memberships.length > 1 && selectedCompanyId && memberships.some((membership) => membership.companyId === selectedCompanyId)) {
    return { status: "selected" as const, companyId: selectedCompanyId };
  }
  return memberships.length > 1 ? { status: "selection_required" as const } : { status: "invalid" as const };
}
