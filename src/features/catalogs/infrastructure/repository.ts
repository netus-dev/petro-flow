import { SupabaseCatalogsRepository } from "./supabase-repository";

// Browser code cannot construct a tenant repository. Server boundaries inject the client.
export const catalogsRepository = new SupabaseCatalogsRepository(null);
