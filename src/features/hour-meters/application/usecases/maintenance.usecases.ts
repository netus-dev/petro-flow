import { Either, left, right } from "../../../../core/utils/either";
import { ResolvedMaintenancePlan, MaintenancePlan } from "../../domain/entities";
import { IMaintenancePlanRepository } from "../../domain/repositories/maintenance.repository";

/**
 * Representa una interfaz base para fallas de lógica de negocio o infraestructura.
 */
export interface Failure {
  /** Mensaje descriptivo de la falla. */
  message: string;
}

/**
 * Falla específica cuando ocurre un error en la capa de datos/repositorio.
 */
export class RepositoryFailure implements Failure {
  constructor(public readonly message: string) {}
}

/**
 * Caso de uso para obtener y calcular el próximo plan de mantenimiento de un activo.
 * Combina planes por intervalos cíclicos y umbrales fijos puntuales, determinando
 * el vencimiento más cercano y fusionando actividades si coinciden en el mismo umbral.
 */
export class GetNextMaintenancePlanUseCase {
  constructor(private repository: IMaintenancePlanRepository) {}

  /**
   * Ejecuta la lógica de negocio para resolver el próximo mantenimiento.
   * @param equipmentId Identificador del activo físico.
   * @param equipmentName Nombre descriptivo del activo.
   * @param currentReading Lectura actual del horómetro en horas.
   * @returns Promesa que resuelve a un Either conteniendo la falla o el plan resuelto (o null si no aplica).
   */
  async execute(
    equipmentId: string,
    equipmentName: string,
    currentReading: number
  ): Promise<Either<Failure, ResolvedMaintenancePlan | null>> {
    try {
      const plans = await this.repository.getPlansByEquipmentId(equipmentId);

      if (!plans || plans.length === 0) {
        return right(null);
      }

      // Estructura para almacenar cada plan asociado con su siguiente umbral calculado
      const resolvedThresholds: { plan: MaintenancePlan; nextThreshold: number }[] = [];

      for (const plan of plans) {
        let nextThreshold: number | null = null;

        if (plan.intervalHours && plan.intervalHours > 0) {
          // Caso A: Plan Cíclico
          // nextThreshold = Math.ceil((currentReading + 1) / intervalHours) * intervalHours
          nextThreshold = Math.ceil((currentReading + 1) / plan.intervalHours) * plan.intervalHours;
        } else if (plan.fixedThresholdHours && plan.fixedThresholdHours > 0) {
          // Caso B: Umbral Fijo Puntual
          if (plan.fixedThresholdHours > currentReading) {
            nextThreshold = plan.fixedThresholdHours;
          }
        }

        if (nextThreshold !== null) {
          resolvedThresholds.push({ plan, nextThreshold });
        }
      }

      if (resolvedThresholds.length === 0) {
        return right(null);
      }

      // Encontrar el menor de los umbrales calculados
      const minThreshold = Math.min(...resolvedThresholds.map((rt) => rt.nextThreshold));

      // Filtrar todos los planes que vencen en este umbral mínimo
      const matchingThresholds = resolvedThresholds.filter((rt) => rt.nextThreshold === minThreshold);

      // Fusionar las actividades de todos los planes que coinciden en el mismo umbral
      const matchingPlans = matchingThresholds.map((rt) => rt.plan);
      const activities = matchingPlans.flatMap((p) => p.activities);

      // Determinar el tipo de plan para la visualización en UI
      let planType: "cyclic" | "fixed" | "merged" = "cyclic";
      if (matchingPlans.length > 1) {
        planType = "merged";
      } else {
        const singlePlan = matchingPlans[0];
        if (singlePlan.fixedThresholdHours && !singlePlan.intervalHours) {
          planType = "fixed";
        }
      }

      const resolvedPlan: ResolvedMaintenancePlan = {
        equipmentId,
        equipmentName,
        currentReading,
        nextThresholdHours: minThreshold,
        activities,
        planType
      };

      return right(resolvedPlan);
    } catch (error: any) {
      return left(new RepositoryFailure(error?.message || "Error desconocido al procesar planes de mantenimiento."));
    }
  }
}
