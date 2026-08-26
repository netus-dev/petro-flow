"use server";

import { loadAuthorization } from "../../../authorization/infrastructure/server/authorization-session";
import { ExecuteAccessControlCommand, ReadAccessControlSnapshot } from "../../application/access-control-use-cases";
import type { AccessControlCommand } from "../../domain/access-control";
import { SupabaseAccessControlRepository } from "../supabase-access-control-repository";

/** Executes panel reads and writes through server-authoritative authorization. */
export async function readAccessControlSnapshot() { return new ReadAccessControlSnapshot(new SupabaseAccessControlRepository(), async () => { const result = await loadAuthorization(); return result.status === "ok" ? result.projection : null; }).execute(); }
export async function runAccessControlCommand(command: AccessControlCommand) { return new ExecuteAccessControlCommand(new SupabaseAccessControlRepository(), async () => { const result = await loadAuthorization(); return result.status === "ok" ? result.projection : null; }).execute(command); }
