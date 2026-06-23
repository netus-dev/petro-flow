import { MockMaintenanceDatasource } from "./datasources/maintenance.datasource";
import { MaintenancePlanRepositoryImpl } from "./repositories/maintenance.repository.impl";

// Guard de seguridad según la sección V de la Constitución para prevenir uso de mock en producción.
if (process.env.NODE_ENV === "production") {
  throw new Error("CRITICAL: MockMaintenanceDatasource cannot be used in a production environment!");
}

/**
 * Singleton del repositorio de planes de mantenimiento.
 * Proporciona un único punto de acceso a la capa de datos de mantenimiento,
 * inyectando el datasource simulado para entorno de desarrollo.
 */
export const maintenanceRepository = new MaintenancePlanRepositoryImpl(
  new MockMaintenanceDatasource()
);
