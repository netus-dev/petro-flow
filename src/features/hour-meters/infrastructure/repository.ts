import { MockMaintenanceDatasource } from "./datasources/maintenance.datasource";
import { MaintenancePlanRepositoryImpl } from "./repositories/maintenance.repository.impl";
import { MockKpiDatasource } from "./datasources/kpi.datasource";
import { KpiRepositoryImpl } from "./repositories/kpi.repository";

// Guard de seguridad según la sección V de la Constitución para prevenir uso de mock en producción.
if (process.env.NODE_ENV === "production") {
  throw new Error("CRITICAL: MockMaintenanceDatasource or MockKpiDatasource cannot be used in a production environment!");
}

/**
 * Singleton del repositorio de planes de mantenimiento.
 * Proporciona un único punto de acceso a la capa de datos de mantenimiento,
 * inyectando el datasource simulado para entorno de desarrollo.
 */
export const maintenanceRepository = new MaintenancePlanRepositoryImpl(
  new MockMaintenanceDatasource()
);

/**
 * Singleton del repositorio de KPIs de activos.
 * Proporciona un único punto de acceso a los KPIs del activo,
 * inyectando el datasource mock para el entorno de desarrollo.
 */
export const kpiRepository = new KpiRepositoryImpl(
  new MockKpiDatasource()
);

