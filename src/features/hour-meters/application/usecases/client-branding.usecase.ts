import { Either, left, right } from "../../../../core/utils/either";
import { ClientBranding } from "../../domain/entities";
import { IClientBrandingRepository } from "../../domain/repositories/client-branding.repository";

export interface ClientBrandingFailure { message: string; }
export class ClientBrandingRepositoryFailure implements ClientBrandingFailure {
  constructor(public readonly message: string) {}
}

/** Retrieves the branding for the current client session. */
export class GetCurrentClientBrandingUseCase {
  constructor(private readonly repository: IClientBrandingRepository) {}

  async execute(): Promise<Either<ClientBrandingFailure, ClientBranding>> {
    try {
      return right(await this.repository.getCurrentClient());
    } catch (error: unknown) {
      return left(new ClientBrandingRepositoryFailure(error instanceof Error ? error.message : "No fue posible cargar la marca del cliente."));
    }
  }
}
