import { SupabaseKpiDatasource } from "./datasources/kpi.datasource";
import { KpiRepositoryImpl } from "./repositories/kpi.repository";

/**
 * Creates the production KPI repository with an already validated Supabase client.
 */
export function createKpiRepository(supabase: ConstructorParameters<typeof SupabaseKpiDatasource>[0]) {
  return new KpiRepositoryImpl(new SupabaseKpiDatasource(supabase));
}
