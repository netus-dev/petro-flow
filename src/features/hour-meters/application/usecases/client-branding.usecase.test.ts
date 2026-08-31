import { describe, expect, it } from "vitest";
import { GetCurrentClientBrandingUseCase } from "./client-branding.usecase";
import { toClientBranding } from "../../infrastructure/mappers/client-branding.mapper";

describe("client branding", () => {
  it("maps optional logo URLs without leaking DTO names", () => {
    expect(toClientBranding({ client_id: "c1", client_name: "Cliente Uno", logo_url: null })).toEqual({ clientId: "c1", clientName: "Cliente Uno", logoUrl: undefined });
  });

  it("returns current-session branding through the repository port", async () => {
    const result = await new GetCurrentClientBrandingUseCase({ getCurrentClient: async () => ({ clientId: "c1", clientName: "Cliente Uno" }) }).execute();
    expect(result.isRight() && result.value.clientName).toBe("Cliente Uno");
  });
});
