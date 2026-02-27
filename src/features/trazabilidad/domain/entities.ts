export type AssetStatus = "Operativo" | "En mantenimiento" | "En tránsito";
export type StopStatus = "completed" | "in-progress" | "pending";
export type FunctionalPrinciple = "Tubular" | "Herramienta" | "Componente";

export interface JourneyStop {
  id: string;
  provider: string;
  location: string;
  service: string;
  dateIn: string;
  dateOut: string | null;
  status: StopStatus;
  notes: string;
  responsible?: string;
}

export interface Asset {
  id: string;
  code: string;
  functionalPrinciple: FunctionalPrinciple;
  brand: string;
  model: string;
  serialNumber: string;
  currentLocation: string;
  position: string;
  status: AssetStatus;
  lastMovementDate: string;
  name: string; // Keep for compatibility
  type: string; // Keep for compatibility
  journey: JourneyStop[];
}

export interface TrazabilidadStats {
  totalAssets: number;
  assetsInRig702: number;
  assetsInRig703: number;
  assetsInTransit: number;
  assetsInProviderBase: number;
  distributionByLocation: { name: string; value: number }[];
  movementsLast30Days: { date: string; count: number }[];
  alerts: {
    type: "high-movement" | "no-location";
    assetCode: string;
    message: string;
  }[];
}
