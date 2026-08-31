import { ClientBranding } from "../../domain/entities";

interface ClientBrandingDto {
  client_id: string;
  client_name: string;
  logo_url?: string | null;
}

/** Maps infrastructure naming to the stable domain branding model. */
export function toClientBranding(dto: ClientBrandingDto): ClientBranding {
  return { clientId: dto.client_id, clientName: dto.client_name, logoUrl: dto.logo_url ?? undefined };
}
