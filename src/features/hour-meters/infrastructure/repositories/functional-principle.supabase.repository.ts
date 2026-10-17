import { SupabaseClient } from "@supabase/supabase-js";
import { FunctionalPrincipleReference } from "../../domain/entities";
import { IFunctionalPrincipleRepository } from "../../domain/repositories/functional-principle.repository";
import { toFunctionalPrincipleReference } from "../mappers/functional-principle.mapper";

export class SupabaseFunctionalPrincipleRepository implements IFunctionalPrincipleRepository {
	constructor(private readonly supabase: SupabaseClient) { }

	async listByCompany(companyId: string): Promise<FunctionalPrincipleReference[]> {
		const { data, error } = await this.supabase
			.from("functional_principles")
			.select("id, name")
			.eq("company_id", companyId)
			.order("name");

		if (error) {
			throw new Error(error.message);
		}

		return (data ?? [])
			.map((row) => toFunctionalPrincipleReference(row as { id: string | null; name: string | null }))
			.filter((item): item is FunctionalPrincipleReference => item !== null);
	}

}