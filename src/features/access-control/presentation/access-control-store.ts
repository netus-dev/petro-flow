"use client";

import { create } from "zustand";
import type { AccessControlCommand, AccessControlSnapshot } from "../domain/access-control";
import { runAccessControlCommand, readAccessControlSnapshot } from "../infrastructure/server/access-control-actions";

interface AccessControlState extends Partial<AccessControlSnapshot> {
  isLoading: boolean; error: string | null; refresh: () => Promise<void>; execute: (command: AccessControlCommand) => Promise<boolean>;
}

export const useAccessControlStore = create<AccessControlState>((set, get) => ({
  isLoading: false, error: null,
  refresh: async () => { set({ isLoading: true, error: null }); const result = await readAccessControlSnapshot(); if (result.isLeft()) set({ error: result.value.message, isLoading: false }); else set({ ...result.value, isLoading: false }); },
  execute: async (command) => { const result = await runAccessControlCommand(command); if (result.isLeft()) { set({ error: result.value.message }); return false; } await get().refresh(); return true; },
}));

export const useAccessControlRoles = () => useAccessControlStore((state) => state.roles ?? []);
export const useAccessControlPermissions = () => useAccessControlStore((state) => state.permissions ?? []);
export const useAccessControlCompanies = () => useAccessControlStore((state) => state.companies ?? []);
export const useAccessControlMemberships = () => useAccessControlStore((state) => state.memberships ?? []);
export const useAccessControlEntitlements = () => useAccessControlStore((state) => state.entitlements ?? []);
export const useAccessControlAssignments = () => useAccessControlStore((state) => state.assignments ?? []);
export const useAccessControlAuditEvents = () => useAccessControlStore((state) => state.auditEvents ?? []);
export const useAccessControlLoading = () => useAccessControlStore((state) => state.isLoading);
export const useAccessControlError = () => useAccessControlStore((state) => state.error);
export const useRefreshAccessControl = () => useAccessControlStore((state) => state.refresh);
export const useExecuteAccessControl = () => useAccessControlStore((state) => state.execute);
