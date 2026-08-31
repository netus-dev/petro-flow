"use client";

import { useEffect, useState } from "react";
import { ClientBranding } from "../../domain/entities";
import { GetCurrentClientBrandingUseCase } from "../../application/usecases/client-branding.usecase";
import { MockClientBrandingRepository } from "../../infrastructure/repositories/client-branding.mock.repository";

const getCurrentClientBranding = new GetCurrentClientBrandingUseCase(new MockClientBrandingRepository());

/** Presentation adapter for current-session client branding. */
export function useClientBranding() {
  const [branding, setBranding] = useState<ClientBranding | null>(null);
  useEffect(() => {
    void getCurrentClientBranding.execute().then((result) => {
      if (result.isRight()) setBranding(result.value);
    });
  }, []);
  return branding;
}
