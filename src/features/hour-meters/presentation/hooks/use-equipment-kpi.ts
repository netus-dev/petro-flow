import { useState, useEffect, useRef } from "react";
import { EquipmentKpi, ReliabilityPeriod } from "../../domain/entities";
import { readEquipmentKpi } from "../../infrastructure/server/kpi-actions";

/**
 * Hook personalizado para obtener los KPIs operacionales de un activo reactivamente.
 * Gestiona estados de carga, cambios de activo y selección de período de confiabilidad.
 */
export function useEquipmentKpi(assetId: string | null) {
  const [kpi, setKpi] = useState<EquipmentKpi | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reliabilityPeriod, setReliabilityPeriod] = useState<ReliabilityPeriod>("1m");

  const activeLoadingId = useRef<string | null>(null);

  useEffect(() => {
    if (!assetId) {
      setKpi(null);
      setIsLoading(false);
      activeLoadingId.current = null;
      return;
    }

    const loadKpi = async () => {
      setIsLoading(true);
      setKpi(null);
      activeLoadingId.current = assetId;

       const result = await readEquipmentKpi(assetId);

      if (activeLoadingId.current === assetId) {
        setIsLoading(false);
        if (result.ok) {
          setKpi(result.data);
        } else {
          setKpi(null);
          console.error("Falla al obtener KPIs:", result.error);
        }
      }
    };

    loadKpi();
  }, [assetId]);

  return {
    kpi,
    isLoading,
    reliabilityPeriod,
    setReliabilityPeriod,
  };
}
