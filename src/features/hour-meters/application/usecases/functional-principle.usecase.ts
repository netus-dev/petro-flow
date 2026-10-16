import { Either, left, right } from "@/src/core/utils/either";
import { IFunctionalPrincipleRepository } from "../../domain/repositories/functional-principle.repository";
import { FunctionalPrincipleReference } from "../../domain/entities";

export interface FunctionalPrincipleFailure {
	message: string;
}

export class FunctionalPrincipleRepositoryFailure implements FunctionalPrincipleFailure {
	constructor(public readonly message: string) { }
}

/**
 * Obtiene los principios funcionales activos para la empresa activa.
 */
export class GetFunctionalPrinciplesByCompanyUseCase {
	constructor(private readonly repository: IFunctionalPrincipleRepository) { }

	async execute(
		companyId: string
	): Promise<Either<FunctionalPrincipleFailure, FunctionalPrincipleReference[]>> {

		if (!companyId || !companyId.trim()) {
			return left(
				new FunctionalPrincipleRepositoryFailure("El identificador de empresa es requerido.")
			);
		}

		try {
			const principles = await this.repository.listByCompany(companyId.trim());
			return right(principles);

		} catch (error: unknown) {
			return left(
				new FunctionalPrincipleRepositoryFailure(
					error instanceof Error ? error.message : "No fue posible cargar los principios funcionales."
				)
			);
		}
	}
}