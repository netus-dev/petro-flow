import { SupabaseCatalogsRepository } from "./supabase-repository";

// Exportamos un Singleton para ser usado en la capa de presentacion (Hooks)
export const catalogsRepository = new SupabaseCatalogsRepository();
