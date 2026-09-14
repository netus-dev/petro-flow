"use client";

import { FormEvent, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/core/presentation/components/ui/table";
import {
  FunctionalPrincipleInventoryItem,
  getInventoryAvailability,
} from "../../domain/entities";
import { InventoryInput } from "../../application/usecases/inventory.usecases";
import { useInventoryManagement } from "../hooks/use-asset-inventory";
import { InventoryPrincipleOption } from "./inventory-principles";
import {
  createInventoryDraft,
  isInventoryDraftSubmittable,
} from "./inventory-management-model";

/** Management UI constrained to principles represented by visible Dashboard assets. */
export function InventoryManagementModal({
  principles,
}: {
  principles: readonly InventoryPrincipleOption[];
}) {
  const visiblePrincipleIds = principles.map((principle) => principle.id);
  const { items, isLoading, error, save, remove } =
    useInventoryManagement(visiblePrincipleIds);
  const [form, setForm] = useState<InventoryInput | null>(() =>
    createInventoryDraft(principles),
  );
  const [editing, setEditing] = useState<string>();
  const [message, setMessage] = useState<string>();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(undefined);
    if (!isInventoryDraftSubmittable(form, principles)) {
      setMessage("No hay un principio funcional disponible.");
      return;
    }
    const result = await save(form, editing);
    if (result.error) setMessage(result.error);
    else {
      setMessage("Material guardado correctamente.");
      setEditing(undefined);
      setForm(createInventoryDraft(principles));
    }
  };

  const edit = (item: FunctionalPrincipleInventoryItem) => {
    setEditing(item.id);
    setForm({
      functionalPrincipleId: item.functionalPrincipleId,
      material: item.material,
      specification: item.specification,
      quantityInStock: item.quantityInStock,
      minimumStock: item.minimumStock,
    });
  };

  if (!form) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No hay principios funcionales disponibles en los activos visibles.
      </p>
    );
  }

  return (
    <div className="grid max-h-[90vh] min-h-0 gap-6 overflow-y-auto lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.4fr)]">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            {editing ? "Editar material" : "Registrar material"}
          </h2>
          <p className="text-sm text-muted-foreground">
            El inventario se comparte entre activos del mismo principio funcional.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="inventory-principle">Principio funcional</Label>
            <select
              id="inventory-principle"
              required
              value={form.functionalPrincipleId}
              onChange={(event) =>
                setForm({ ...form, functionalPrincipleId: event.target.value })
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              {principles.map((principle) => (
                <option key={principle.id} value={principle.id}>
                  {principle.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inventory-material">Material o consumible</Label>
            <Input id="inventory-material" required value={form.material} onChange={(event) => setForm({ ...form, material: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inventory-spec">Especificación / número de parte</Label>
            <Input id="inventory-spec" required value={form.specification} onChange={(event) => setForm({ ...form, specification: event.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="inventory-qty">Existencia</Label>
              <Input id="inventory-qty" type="number" min="0" step="1" required value={form.quantityInStock} onChange={(event) => setForm({ ...form, quantityInStock: Number(event.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory-min">Mínimo</Label>
              <Input id="inventory-min" type="number" min="0" step="1" required value={form.minimumStock} onChange={(event) => setForm({ ...form, minimumStock: Number(event.target.value) })} />
            </div>
          </div>
          {message && <p role="status" className="text-sm">{message}</p>}
          <div className="flex gap-2">
            <Button type="submit"><Plus />{editing ? "Actualizar" : "Guardar"}</Button>
            {editing && <Button type="button" variant="outline" onClick={() => { setEditing(undefined); setForm(createInventoryDraft(principles)); }}>Cancelar</Button>}
          </div>
        </form>
      </section>
      <section className="min-w-0 space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Inventario registrado</h2>
          <p className="text-sm text-muted-foreground">Solo se muestran registros activos de los principios visibles.</p>
        </div>
        {isLoading ? <p role="status">Cargando inventario...</p> : error ? <p role="alert" className="text-sm text-destructive">{error}</p> : items.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">No hay materiales registrados.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Material</TableHead><TableHead>Principio funcional</TableHead><TableHead>Stock</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>{items.map((item) => {
              const status = getInventoryAvailability(item);
              const principleName = principles.find((principle) => principle.id === item.functionalPrincipleId)?.name ?? item.functionalPrincipleId;
              return <TableRow key={item.id}><TableCell><div className="font-medium">{item.material}</div><div className="text-xs text-muted-foreground">{item.specification}</div></TableCell><TableCell>{principleName}</TableCell><TableCell>{item.quantityInStock} / {item.minimumStock}</TableCell><TableCell>{status === "sufficient" ? "Suficiente" : status === "critical" ? "Crítico" : "Agotado"}</TableCell><TableCell className="text-right"><Button aria-label={`Editar ${item.material}`} size="icon-sm" variant="ghost" onClick={() => edit(item)}><Pencil /></Button><Button aria-label={`Eliminar ${item.material}`} size="icon-sm" variant="ghost" onClick={async () => { if (window.confirm("¿Eliminar este material?")) await remove(item.id); }}><Trash2 /></Button></TableCell></TableRow>;
            })}</TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
