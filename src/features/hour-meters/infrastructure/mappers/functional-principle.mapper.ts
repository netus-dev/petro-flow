import { FunctionalPrincipleReference } from "../../domain/entities";

export interface FunctionalPrincipleRow {
	id: string | null;
	name: string | null;
}

export function toFunctionalPrincipleReference(
	row: FunctionalPrincipleRow
): FunctionalPrincipleReference | null {

	if (!row.id || !row.name) return null;

	return {
		id: String(row.id),
		name: String(row.name).trim(),
	}
}