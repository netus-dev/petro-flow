import { IClientBrandingRepository } from "../../domain/repositories/client-branding.repository";
import { ClientBranding } from "../../domain/entities";
import { toClientBranding } from "../mappers/client-branding.mapper";

const currentClient = toClientBranding({ client_id: "cliente-demo", client_name: "Operaciones Andinas", logo_url: null });

/** Infrastructure-only session branding source for the MVP. */
export class MockClientBrandingRepository implements IClientBrandingRepository {
  async getCurrentClient(): Promise<ClientBranding> {
    return { ...currentClient };
  }
}
