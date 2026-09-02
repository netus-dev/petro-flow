"use client";

import { create } from "zustand";
import type { AccessControlCommand, AccessControlSnapshot } from "../domain/access-control";
import { runAccessControlCommand, readAccessControlSnapshot } from "../infrastructure/server/access-control-actions";

interface AccessControlState extends Partial<AccessControlSnapshot> {
  isLoading: boolean; error: string | null; refresh: () => Promise<void>; execute: (command: AccessControlCommand) => Promise<boolean>;
}

const EMPTY_ROLES: AccessControlSnapshot["roles"] = [];
const EMPTY_PERMISSIONS: AccessControlSnapshot["permissions"] = [];
const EMPTY_ROLE_PERMISSIONS: AccessControlSnapshot["rolePermissions"] = [];
const EMPTY_COMPANIES: AccessControlSnapshot["companies"] = [];
const EMPTY_USERS: AccessControlSnapshot["users"] = [];
const EMPTY_MEMBERSHIPS: AccessControlSnapshot["memberships"] = [];
const EMPTY_ENTITLEMENTS: AccessControlSnapshot["entitlements"] = [];
const EMPTY_ASSIGNMENTS: AccessControlSnapshot["assignments"] = [];
const EMPTY_AUDIT_EVENTS: AccessControlSnapshot["auditEvents"] = [];

export const useAccessControlStore = create<AccessControlState>((set, get) => ({
  isLoading: false, error: null,
  refresh: async () => { set({ isLoading: true, error: null }); const result = await readAccessControlSnapshot(); if (!result.ok) set({ error: result.error, isLoading: false }); else set({ ...result.data, isLoading: false }); },
  execute: async (command) => { set({ isLoading: true, error: null }); const result = await runAccessControlCommand(command); if (!result.ok) { set({ error: result.error, isLoading: false }); return false; } await get().refresh(); return true; },
}));

export const useAccessControlRoles = () => useAccessControlStore((state) => state.roles ?? EMPTY_ROLES);
export const useAccessControlPermissions = () => useAccessControlStore((state) => state.permissions ?? EMPTY_PERMISSIONS);
export const useAccessControlRolePermissions = () => useAccessControlStore((state) => state.rolePermissions ?? EMPTY_ROLE_PERMISSIONS);
export const useAccessControlCompanies = () => useAccessControlStore((state) => state.companies ?? EMPTY_COMPANIES);
export const useAccessControlUsers = () => useAccessControlStore((state) => state.users ?? EMPTY_USERS);
export const useAccessControlMemberships = () => useAccessControlStore((state) => state.memberships ?? EMPTY_MEMBERSHIPS);
export const useAccessControlEntitlements = () => useAccessControlStore((state) => state.entitlements ?? EMPTY_ENTITLEMENTS);
export const useAccessControlAssignments = () => useAccessControlStore((state) => state.assignments ?? EMPTY_ASSIGNMENTS);
export const useAccessControlAuditEvents = () => useAccessControlStore((state) => state.auditEvents ?? EMPTY_AUDIT_EVENTS);
export const useAccessControlLoading = () => useAccessControlStore((state) => state.isLoading);
export const useAccessControlError = () => useAccessControlStore((state) => state.error);
export const useRefreshAccessControl = () => useAccessControlStore((state) => state.refresh);
export const useExecuteAccessControl = () => useAccessControlStore((state) => state.execute);
