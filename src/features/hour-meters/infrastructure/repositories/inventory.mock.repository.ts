import { AssetInventoryItem } from "../../domain/entities";
import { IInventoryRepository } from "../../domain/repositories/inventory.repository";
import { InventoryInput } from "../../application/usecases/inventory.usecases";

const inventory: AssetInventoryItem[] = [
  { id: "inv-001", assetId: "ODO-001", material: "Filtro de aceite", specification: "OF-240 / 10 micras", quantityInStock: 8, minimumStock: 2, scope: "shared_equipment_type", equipmentType: "Motores de Generadores" },
  { id: "inv-002", assetId: "ODO-001", material: "Aceite hidráulico", specification: "ISO VG 46 / 20 L", quantityInStock: 2, minimumStock: 2, scope: "shared_equipment_type", equipmentType: "Motores de Generadores" },
  { id: "inv-003", assetId: "ODO-001", material: "Correa de transmisión", specification: "SPB 2240", quantityInStock: 0, minimumStock: 1, scope: "shared_equipment_type", equipmentType: "Motores de Generadores" },
  { id: "inv-004", assetId: "ODO-002", material: "Filtro de aire", specification: "AF-185 / Generador", quantityInStock: 5, minimumStock: 1, scope: "shared_equipment_type", equipmentType: "Motores de Generadores" },
  { id: "inv-005", assetId: "ODO-002", material: "Refrigerante", specification: "50/50 / 20 L", quantityInStock: 1, minimumStock: 2, scope: "shared_equipment_type", equipmentType: "Motores de Generadores" },
  { id: "inv-006", assetId: "ODO-006", material: "Sello hidráulico", specification: "Bomba de lodo / alta presión", quantityInStock: 4, minimumStock: 1, scope: "shared_equipment_type", equipmentType: "Bombas de Lodo" },
  { id: "inv-007", assetId: "ODO-007", material: "Kit de empaques", specification: "Bomba de lodo / estándar", quantityInStock: 3, minimumStock: 1, scope: "shared_equipment_type", equipmentType: "Bombas de Lodo" },
  { id: "inv-008", assetId: "ODO-003", material: "Filtro de combustible", specification: "Motor generador / estándar", quantityInStock: 4, minimumStock: 1, scope: "shared_equipment_type", equipmentType: "Motores de Generadores" },
  { id: "inv-009", assetId: "ODO-004", material: "Bujía de precalentamiento", specification: "Motor generador / 24V", quantityInStock: 6, minimumStock: 2, scope: "shared_equipment_type", equipmentType: "Motores de Generadores" },
  { id: "inv-010", assetId: "ODO-005", material: "Filtro hidráulico", specification: "Motor generador / retorno", quantityInStock: 2, minimumStock: 1, scope: "shared_equipment_type", equipmentType: "Motores de Generadores" },
  { id: "inv-011", assetId: "ODO-008", material: "Válvula de descarga", specification: "Bomba de lodo / alta presión", quantityInStock: 2, minimumStock: 1, scope: "shared_equipment_type", equipmentType: "Bombas de Lodo" },
];

/** Mock-first inventory repository; storage can be replaced without changing presentation. */
export class MockInventoryRepository implements IInventoryRepository {
  private records = [...inventory];
  async getByAssetId(assetId: string): Promise<AssetInventoryItem[]> {
    const selected = this.records.find((item) => item.assetId === assetId);
    return this.records.filter((item) => item.scope === "shared_equipment_type" && selected ? item.equipmentType === selected.equipmentType : item.assetId === assetId).map((item) => ({ ...item }));
  }
  async getAll() { return this.records.map((item) => ({ ...item })); }
  async create(item: InventoryInput) { const record = { ...item, id: `inv-${Date.now()}` }; this.records = [...this.records, record]; return { ...record }; }
  async update(id: string, item: InventoryInput) { const record = { ...item, id }; this.records = this.records.map((current) => current.id === id ? record : current); return { ...record }; }
  async delete(id: string) { this.records = this.records.filter((item) => item.id !== id); }
}
