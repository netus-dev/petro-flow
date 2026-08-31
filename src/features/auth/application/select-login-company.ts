import { resolveCompanySelection, type CompanyMembership } from "../domain/entities/companyMembership";

/**
 * Selects the login company and confirms its server-side context.
 *
 * @returns Whether navigation is allowed after context selection succeeds.
 */
export async function selectLoginCompany(
  memberships: CompanyMembership[],
  selectedCompanyId: string,
  selectCompany: (companyId: string) => Promise<{ status: "ok" | "forbidden" | "error"; message?: string }>,
) {
  const selection = resolveCompanySelection(memberships, selectedCompanyId);
  if (selection.status !== "selected") return false;
  return (await selectCompany(selection.companyId)).status === "ok";
}
