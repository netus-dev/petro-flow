import { FunctionalPrincipleReference } from "../entities";

/**
 * Contrato de persistencia para principios funcionales acotados a una empresa
 */
export interface IFunctionalPrincipleRepository {
	/**
	 * Lista los principios funcionales activos para la empresa activa.
	 * @param companyId El identificador de empresa.
	 * @returns Una promesa con la lista de principios funcionales activos.
	 */
	listByCompany(companyId: string): Promise<FunctionalPrincipleReference[]>
}