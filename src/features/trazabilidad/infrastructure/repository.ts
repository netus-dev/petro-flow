import { Asset, TrazabilidadStats } from "../domain/entities";
import { ITrazabilidadRepository } from "../domain/repository";
import { SupabaseTrazabilidadRepository } from "./supabase-repository";

const assets: Asset[] = [
  {
    id: "AST-001",
    code: "TUB-702-001",
    functionalPrinciple: "Tubular",
    brand: "VAM",
    model: "VAM21",
    serialNumber: "SN-702-001",
    currentLocation: "RIG 702",
    position: "Bodega A",
    status: "Operativo",
    lastMovementDate: "2026-02-25",
    name: 'Tubería de Perforación 5"',
    type: "Tubería",
    journey: [
      {
        id: "M1",
        provider: "Base Operativa Norte",
        location: "Base Operativa Norte",
        service: "Traslado",
        dateIn: "2026-02-20",
        dateOut: "2026-02-21",
        status: "completed",
        notes: "Despacho a RIG 702",
        responsible: "Juan Perez",
      },
      {
        id: "M2",
        provider: "RIG 702",
        location: "RIG 702",
        service: "Recepción",
        dateIn: "2026-02-21",
        dateOut: null,
        status: "completed",
        notes: "Recibido en RIG 702",
        responsible: "Maria Lopez",
      },
    ],
    certificates: [
      {
        id: "CERT-001",
        name: "Certificado de Inspección VAM",
        uploadDate: "2026-01-15",
        fileUrl: "/certificates/tub-702-001-insp.pdf",
      },
    ],
    properties: [],
  },
  {
    id: "AST-002",
    code: "HER-703-042",
    functionalPrinciple: "Herramienta",
    brand: "Schlumberger",
    model: "MWD-01",
    serialNumber: "SN-MWD-42",
    currentLocation: "RIG 703",
    position: "Piso de perforación",
    status: "En tránsito",
    lastMovementDate: "2026-02-27",
    name: "Herramienta MWD",
    type: "Herramienta",
    journey: [
      {
        id: "M1",
        provider: "Base Proveedor",
        location: "Base Proveedor",
        service: "Mantenimiento",
        dateIn: "2026-02-10",
        dateOut: "2026-02-26",
        status: "completed",
        notes: "Mantenimiento preventivo completado",
        responsible: "Carlos Ruiz",
      },
      {
        id: "M2",
        provider: "RIG 703",
        location: "En tránsito",
        service: "Traslado",
        dateIn: "2026-02-27",
        dateOut: null,
        status: "in-progress",
        notes: "Enviado a RIG 703",
        responsible: "Pedro Garcia",
      },
    ],
    certificates: [
      {
        id: "CERT-002",
        name: "Calibración MWD-01",
        uploadDate: "2026-02-05",
        fileUrl: "/certificates/her-703-042-cal.pdf",
      },
    ],
    properties: [],
  },
  {
    id: "AST-003",
    code: "COM-BASE-099",
    functionalPrinciple: "Componente",
    brand: "National Oilwell Varco",
    model: "TopDrive-XT",
    serialNumber: "SN-TD-099",
    currentLocation: "Base Proveedor",
    position: "Taller Mecánico",
    status: "En mantenimiento",
    lastMovementDate: "2026-02-15",
    name: "Componente Top Drive",
    type: "Componente",
    journey: [
      {
        id: "M1",
        provider: "RIG 702",
        location: "RIG 702",
        service: "Retiro",
        dateIn: "2026-02-14",
        dateOut: "2026-02-15",
        status: "completed",
        notes: "Falla reportada en sistema hidráulico",
        responsible: "Ana Martinez",
      },
      {
        id: "M2",
        provider: "Base Proveedor",
        location: "Base Proveedor",
        service: "Diagnóstico",
        dateIn: "2026-02-15",
        dateOut: null,
        status: "in-progress",
        notes: "Esperando repuestos",
        responsible: "Ing. Manuel Sosa",
      },
    ],
    certificates: [],
    properties: [],
  },
];

export class MockTrazabilidadRepository implements ITrazabilidadRepository {
  async getAssetList(): Promise<Asset[]> {
    return assets;
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    return assets.find((a) => a.id === id);
  }

  async getDashboardStats(): Promise<TrazabilidadStats> {
    return {
      totalAssets: assets.length,
      assetsInRig702: assets.filter((a) => a.currentLocation === "RIG 702")
        .length,
      assetsInRig703: assets.filter((a) => a.currentLocation === "RIG 703")
        .length,
      assetsInTransit: assets.filter((a) => a.status === "En tránsito").length,
      assetsInProviderBase: assets.filter(
        (a) => a.currentLocation === "Base Proveedor",
      ).length,
      distributionByLocation: [
        { name: "RIG 702", value: 45 },
        { name: "RIG 703", value: 30 },
        { name: "Base Proveedor", value: 15 },
        { name: "Tránsito", value: 10 },
      ],
      movementsLast30Days: [
        { date: "2026-02-01", count: 12 },
        { date: "2026-02-05", count: 18 },
        { date: "2026-02-10", count: 15 },
        { date: "2026-02-15", count: 22 },
        { date: "2026-02-20", count: 19 },
        { date: "2026-02-25", count: 25 },
      ],
      alerts: [
        {
          type: "high-movement",
          assetCode: "TUB-702-001",
          message: "Mas de 3 movimientos en 7 dias",
        },
        {
          type: "no-location",
          assetCode: "COM-BASE-099",
          message: "Sin ubicación fisica asignada",
        },
      ],
    };
  }

  async registerMovement(assetId: string, movement: any): Promise<void> {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      asset.currentLocation = movement.destination;
      asset.lastMovementDate = new Date().toISOString().split("T")[0];
      asset.journey.push({
        id: `M${asset.journey.length + 1}`,
        provider: movement.destination,
        location: movement.destination,
        service: movement.type,
        dateIn: asset.lastMovementDate,
        dateOut: null,
        status: "completed",
        notes: movement.comments,
        responsible: movement.responsible,
      });
    }
  }

  async registerBulkMovement(payload: any): Promise<void> {
    console.log("Mock registerBulkMovement", payload);
  }

  async addCertificate(
    assetId: string,
    certificates: { file: File; name: string }[],
  ): Promise<void> {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      certificates.forEach(cert => {
        asset.certificates.push({
          id: `CERT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name: cert.name || "Nuevo Certificado",
          uploadDate: new Date().toISOString().split("T")[0],
          fileUrl: "/certificates/placeholder.pdf",
        });
      });
    }
  }

  async registerAsset(asset: Partial<Asset>): Promise<void> {
    const newAsset: Asset = {
      id: `AST-${Date.now()}`,
      code: asset.code || "NEW-ASSET",
      functionalPrinciple: asset.functionalPrinciple || "Tubular",
      brand: asset.brand || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
      currentLocation: asset.currentLocation || "Base Proveedor",
      position: asset.position || "N/A",
      status: asset.status || "Operativo",
      lastMovementDate: new Date().toISOString().split("T")[0],
      name: asset.name || "",
      type: asset.type || "",
      journey: [
        {
          id: "M1",
          provider: "Alta de Activo",
          location: asset.currentLocation || "Base Proveedor",
          service: "Alta",
          dateIn: new Date().toISOString().split("T")[0],
          dateOut: null,
          status: "completed",
          notes: "Registro inicial del activo",
          responsible: "Sistema",
        },
      ],
      certificates: [],
      properties: [], // Added missing property
    };
    assets.push(newAsset);
  }

  async updateAsset(id: string, asset: Partial<Asset>): Promise<void> {
    console.log("Mock updateAsset", id, asset);
  }

  async disableAsset(id: string): Promise<void> {
    console.log("Mock disableAsset", id);
  }

  async getFunctionalPrinciples() {
    return [
      { id: "1", name: "Tubular" },
      { id: "2", name: "Herramienta" },
      { id: "3", name: "Componente" }
    ];
  }

  async getAssetStatsByFunctionalPrinciple(fpId: string) {
    return [
      { location_name: "RIG 702", location_type: "rig", total_assets: 15 },
      { location_name: "RIG 703", location_type: "rig", total_assets: 8 },
      { location_name: "Base Norte", location_type: "operating_base", total_assets: 25 }
    ];
  }
}

export const trazabilidadRepository = new SupabaseTrazabilidadRepository();
