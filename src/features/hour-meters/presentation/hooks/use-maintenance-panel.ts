import { useState, useCallback, useRef } from "react";
import { HourMeterRecord, ResolvedMaintenancePlan } from "../../domain/entities";
import { readMaintenanceThresholds } from "../../infrastructure/server/hour-meter-actions";
import { resolveNextMaintenanceThreshold } from "../../domain/entities";

/**
 * Contrato de retorno para el hook useMaintenancePanel.
 */
export interface UseMaintenancePanelReturn {
  /** Identificador del activo físico seleccionado. null si el panel está cerrado. */
  selectedEquipmentId: string | null;
  /** Plan calculado y resuelto para el activo. null si no hay datos o no hay selección. */
  resolvedPlan: ResolvedMaintenancePlan | null;
  /** Indica si la resolución asíncrona de planes está activa. */
  isLoading: boolean;
  /**
   * Registra la selección de un activo. Si se selecciona el mismo activo,
   * se realiza un toggle para cerrar el panel.
   */
  selectEquipment: (record: HourMeterRecord) => void;
  /** Cierra explícitamente el panel lateral. */
  closePanel: () => void;
}

/**
 * Hook personalizado para manejar el estado local de selección de activo
 * y llamar al caso de uso de resolución de planes de mantenimiento.
 */
export function useMaintenancePanel(): UseMaintenancePanelReturn {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [resolvedPlan, setResolvedPlan] = useState<ResolvedMaintenancePlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ref para prevenir race conditions si el usuario cambia rápidamente de activo
  const activeLoadingId = useRef<string | null>(null);

  /**
   * Cierra el panel y limpia todos los estados asociados.
   */
  const closePanel = useCallback(() => {
    setSelectedEquipmentId(null);
    setResolvedPlan(null);
    setIsLoading(false);
    activeLoadingId.current = null;
  }, []);

  /**
   * Selecciona un activo, inicia la pantalla de carga (Skeleton) y ejecuta
   * el caso de uso para obtener el plan de mantenimiento más próximo.
   */
  const selectEquipment = useCallback(async (record: HourMeterRecord) => {
    // Comportamiento toggle: si hace clic en la misma tarjeta activa, se cierra
    if (selectedEquipmentId === record.id) {
      closePanel();
      return;
    }

    setSelectedEquipmentId(record.id);
    setResolvedPlan(null);
    setIsLoading(true);
    activeLoadingId.current = record.id;

    const result = record.companyId && record.functionalPrincipleId ? await readMaintenanceThresholds(record.functionalPrincipleId) : { ok: false as const, error: "Maintenance scope is unavailable." };
    const next = result.ok ? resolveNextMaintenanceThreshold(result.data.map((item) => item.thresholdHours), record.currentReading ?? 0) : null;
    // Evitar actualización si el usuario ya cambió a otra tarjeta mientras cargaba
    if (activeLoadingId.current === record.id) {
      setIsLoading(false);
      if (result.ok && next !== null) {
        setResolvedPlan({ equipmentId: record.assetId, equipmentName: record.equipment, currentReading: record.currentReading ?? 0, nextThresholdHours: next, activities: [], planType: "cyclic" });
      } else {
        setResolvedPlan(null);
        if (!result.ok) console.error("Falla al resolver plan de mantenimiento:", result.error);
      }
    }
  }, [selectedEquipmentId, closePanel]);

  return {
    selectedEquipmentId,
    resolvedPlan,
    isLoading,
    selectEquipment,
    closePanel
  };
}
