import { ClientBranding } from "../entities";

/** Port for resolving branding without coupling presentation to its source. */
export interface IClientBrandingRepository {
  getCurrentClient(): Promise<ClientBranding>;
}
