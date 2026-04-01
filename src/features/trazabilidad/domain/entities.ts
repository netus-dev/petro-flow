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

export interface AssetCertificate {
  id: string;
  name: string;
  uploadDate: string;
  fileUrl: string;
}

export interface AssetProperty {
  key: string;
  label: string;
  value: string | number;
}

export interface Asset {
  id: string;
  code: string;
  functionalPrinciple: FunctionalPrinciple;
  function_principle_id?: string;
  brand: string;
  model: string;
  brand_id?: string;
  model_id?: string;
  capacity?: string;
  lastInspectionCode?: string;
  serialNumber: string;
  currentLocation: string;
  current_location_id?: string;
  position: string;
  current_ubication_id?: string;
  status: AssetStatus;
  lastMovementDate: string;
  createdAt?: string;
  name: string; // Keep for compatibility
  type: string; // Keep for compatibility
  properties: AssetProperty[];
  journey: JourneyStop[];
  certificates: AssetCertificate[];
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
