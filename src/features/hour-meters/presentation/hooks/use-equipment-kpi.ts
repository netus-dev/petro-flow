import { useState, useEffect, useRef } from "react";
import { EquipmentKpi, ReliabilityPeriod } from "../../domain/entities";
import { GetEquipmentKpiUseCase } from "../../application/usecases/kpi.usecases";
import { kpiRepository } from "../../infrastructure/repository";

const getEquipmentKpiUseCase = new GetEquipmentKpiUseCase(kpiRepository);

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

      const result = await getEquipmentKpiUseCase.execute(assetId);

      if (activeLoadingId.current === assetId) {
        setIsLoading(false);
        if (result.isRight()) {
          setKpi(result.value);
        } else {
          setKpi(null);
          console.error("Falla al obtener KPIs:", result.value.message);
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
