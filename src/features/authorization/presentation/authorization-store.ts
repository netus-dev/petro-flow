"use client";

import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import type { AuthorizationProjection } from "../domain/authorization";

interface AuthorizationState {
  projection: AuthorizationProjection | null;
  hydrate: (projection: AuthorizationProjection) => void;
  clear: () => void;
}

export const createAuthorizationStore = () => createStore<AuthorizationState>((set) => ({
  projection: null,
  hydrate: (projection) => set({ projection }),
  clear: () => set({ projection: null }),
}));

const authorizationStore = createAuthorizationStore();
export const hydrateAuthorization = authorizationStore.getState().hydrate;
export const invalidateAuthorization = authorizationStore.getState().clear;
export const useAuthorizationProjection = () => useStore(authorizationStore, (state) => state.projection);
export const useCapabilities = () => useStore(authorizationStore, (state) => state.projection?.capabilities ?? []);
export const useEnabledModules = () => useStore(authorizationStore, (state) => state.projection?.enabledModules ?? []);
