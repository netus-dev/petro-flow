import { FunctionalPrincipleInventoryItem } from "../../domain/entities";
import { IInventoryRepository } from "../../domain/repositories/inventory.repository";
import { canonicalizeInventoryMaterial, InventoryInput } from "../../application/usecases/inventory.usecases";

const inventory: FunctionalPrincipleInventoryItem[] = [
  { id: "inv-001", companyId: "mock-company", functionalPrincipleId: "principle-generator", material: "Filtro de aceite", specification: "OF-240 / 10 micras", quantityInStock: 8, minimumStock: 2, isActive: true },
  { id: "inv-002", companyId: "mock-company", functionalPrincipleId: "principle-generator", material: "Aceite hidráulico", specification: "ISO VG 46 / 20 L", quantityInStock: 2, minimumStock: 2, isActive: true },
  { id: "inv-003", companyId: "mock-company", functionalPrincipleId: "principle-mud-pump", material: "Sello hidráulico", specification: "Alta presión", quantityInStock: 4, minimumStock: 1, isActive: true },
];

/** Mock-first inventory repository; storage can be replaced without changing presentation. */
export class MockInventoryRepository implements IInventoryRepository {
  private records = [...inventory];
  private nextId = inventory.length + 1;

  private assertNoActiveDuplicate(companyId: string, item: InventoryInput, ignoredId?: string): void {
    const materialKey = canonicalizeInventoryMaterial(item.material);
    const duplicate = this.records.some((record) =>
      record.id !== ignoredId
      && record.companyId === companyId
      && record.functionalPrincipleId === item.functionalPrincipleId
      && record.isActive
      && canonicalizeInventoryMaterial(record.material) === materialKey
    );
    if (duplicate) throw new Error("Ya existe un material activo con ese nombre.");
  }

  async listActive(companyId: string, visiblePrincipleIds: readonly string[]) {
    const visible = new Set(visiblePrincipleIds);
    return this.records.filter((item) => item.companyId === companyId && item.isActive && visible.has(item.functionalPrincipleId)).map((item) => ({ ...item }));
  }
  async getActiveByPrinciple(companyId: string, functionalPrincipleId: string) { return this.listActive(companyId, [functionalPrincipleId]); }
  async create(companyId: string, item: InventoryInput) { this.assertNoActiveDuplicate(companyId, item); const record = { ...item, companyId, isActive: true, id: `inv-${String(this.nextId++).padStart(3, "0")}` }; this.records = [...this.records, record]; return { ...record }; }
  async update(companyId: string, id: string, item: InventoryInput) { const current = this.records.find((record) => record.companyId === companyId && record.id === id); if (!current) throw new Error("Material no encontrado."); this.assertNoActiveDuplicate(companyId, item, id); const record = { ...item, companyId, isActive: current.isActive, id }; this.records = this.records.map((candidate) => candidate.companyId === companyId && candidate.id === id ? record : candidate); return { ...record }; }
  async deactivate(companyId: string, id: string) { this.records = this.records.map((item) => item.companyId === companyId && item.id === id ? { ...item, isActive: false } : item); }
  async reactivate(companyId: string, id: string) { const record = this.records.find((item) => item.companyId === companyId && item.id === id); if (!record) throw new Error("Material no encontrado."); this.assertNoActiveDuplicate(companyId, record, id); this.records = this.records.map((item) => item === record ? { ...item, isActive: true } : item); return { ...record, isActive: true }; }
}
