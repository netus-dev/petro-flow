import { Asset, TrazabilidadStats } from "../domain/entities";
import { ITrazabilidadRepository } from "../domain/repository";

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
}
