"use client";

import { useEffect, useState } from "react";
import { useCatalogs } from "../hooks/use-catalogs";
import { catalogsRepository } from "../../infrastructure/repository";
import { CatalogType, BaseCatalogItem } from "../../domain/entities";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/src/core/presentation/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/src/core/presentation/components/ui/table";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/core/presentation/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
import { Switch } from "@/src/core/presentation/components/ui/switch";
import { Copy, Plus, Trash } from "lucide-react";
import { Separator } from "@/src/core/presentation/components/ui/separator";

export type PropertyType = "text" | "integer" | "decimal";
export interface PropertyItem {
  name: string;
  type: PropertyType;
}

export function CatalogsContent() {
  const { 
    activeCatalog, items, loading, error, 
    handleTabChange, loadItems, createItem, updateItem, deleteItem 
  } = useCatalogs();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [newItemPayload, setNewItemPayload] = useState<{ name: string; type?: string; is_active?: boolean; [key: string]: any }>({ name: "", is_active: true });
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [wellsList, setWellsList] = useState<BaseCatalogItem[]>([]);
  const [suppliersList, setSuppliersList] = useState<BaseCatalogItem[]>([]);

  useEffect(() => {
    loadItems("companies");
  }, [loadItems]);

  useEffect(() => {
    if (activeCatalog === "locations") {
      catalogsRepository.getItems("wells").then(setWellsList).catch(console.error);
      catalogsRepository.getItems("suppliers").then(setSuppliersList).catch(console.error);
    }
  }, [activeCatalog]);

  const openCreateDialog = () => {
    setEditItemId(null);
    setNewItemPayload({ name: "", is_active: true });
    setProperties([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: BaseCatalogItem) => {
    setEditItemId(item.id);
    
    // Parse functional principle properties from db columns
    const parsedProps: PropertyItem[] = [];
    for (let i = 1; i <= 20; i++) {
      const val = item[`property_${i}`];
      if (val) {
        let type: PropertyType = "text";
        if (i >= 11 && i <= 15) type = "integer";
        if (i >= 16 && i <= 20) type = "decimal";

        parsedProps.push({ name: val, type });
      }
    }
    setProperties(parsedProps);
    setNewItemPayload({ 
      name: item.name, 
      type: item.type, 
      is_active: item.is_active !== false,
      current_well_id: item.current_well_id,
      supplier_id: item.supplier_id
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!newItemPayload.name.trim()) return;
    
    // Validar fields obligatorios por catálogo
    if (activeCatalog === "locations" && !newItemPayload.type) return;

    const payloadToSave = { ...newItemPayload };

    if (activeCatalog === "functional_principles") {
      // Clear all properties first to rewrite them completely
      for (let i = 1; i <= 20; i++) {
        payloadToSave[`property_${i}`] = null;
      }

      let textIndex = 1;
      let intIndex = 11;
      let decIndex = 16;

      for (const p of properties) {
        if (!p.name.trim()) continue;
        let targetIndex = 0;
        if (p.type === "text" && textIndex <= 10) {
          targetIndex = textIndex++;
        } else if (p.type === "integer" && intIndex <= 15) {
          targetIndex = intIndex++;
        } else if (p.type === "decimal" && decIndex <= 20) {
          targetIndex = decIndex++;
        }

        if (targetIndex !== 0) {
          // Store directly as plain text
          payloadToSave[`property_${targetIndex}`] = p.name;
        }
      }
    }

    if (editItemId) {
      await updateItem(editItemId, payloadToSave);
    } else {
      await createItem(payloadToSave);
    }
    
    setNewItemPayload({ name: "", is_active: true });
    setProperties([]);
    setEditItemId(null);
    setIsDialogOpen(false);
  };

  const addProperty = () => {
    if (properties.length < 20) {
      setProperties([...properties, { name: "", type: "text" }]);
    }
  };

  const updateProperty = (index: number, key: keyof PropertyItem, value: any) => {
    const newProps = [...properties];
    newProps[index] = { ...newProps[index], [key]: value };
    setProperties(newProps);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const counts = {
    text: properties.filter(p => p.type === "text").length,
    integer: properties.filter(p => p.type === "integer").length,
    decimal: properties.filter(p => p.type === "decimal").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administración de Catálogos</h1>
          <p className="text-muted-foreground">
            Gestiona las entidades base compartidas por todos los módulos.
          </p>
        </div>
        <div>
          <Button onClick={openCreateDialog}>Agregar Elemento</Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItemId ? "Editar Elemento" : "Nuevo Elemento"} ({activeCatalog})</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name" 
                  value={newItemPayload.name} 
                  onChange={(e) => setNewItemPayload({ ...newItemPayload, name: e.target.value })}
                  placeholder="Ej. Nombre del elemento..." 
                />
              </div>

              <div className="flex items-center justify-between mt-2 mb-2">
                <Label htmlFor="is_active" className="cursor-pointer">Activo</Label>
                <Switch 
                  id="is_active" 
                  checked={newItemPayload.is_active} 
                  onCheckedChange={(val) => setNewItemPayload({ ...newItemPayload, is_active: val })}
                />
              </div>

              {activeCatalog === "locations" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Locación</Label>
                    <Select 
                      value={newItemPayload.type} 
                      onValueChange={(val) => setNewItemPayload({ ...newItemPayload, type: val })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Seleccione el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rig">Rig (Equipo)</SelectItem>
                        <SelectItem value="operating_base">Base Operativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newItemPayload.type && (
                    <>
                      <Separator className="my-4" />
                      <h3 className="text-sm font-medium text-muted-foreground pb-2">
                        {newItemPayload.type === 'rig' ? "Sobre el Rig" : "Sobre la base operativa"}
                      </h3>
                      
                      {newItemPayload.type === 'rig' && (
                        <div className="space-y-2">
                          <Label htmlFor="current_well_id">Pozo actual</Label>
                          <Select 
                            value={newItemPayload.current_well_id} 
                            onValueChange={(val) => setNewItemPayload({ ...newItemPayload, current_well_id: val })}
                          >
                            <SelectTrigger id="current_well_id">
                              <SelectValue placeholder="Seleccione el pozo" />
                            </SelectTrigger>
                            <SelectContent>
                              {wellsList.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {newItemPayload.type === 'operating_base' && (
                        <div className="space-y-2">
                          <Label htmlFor="supplier_id">Proveedor propietario</Label>
                          <Select 
                            value={newItemPayload.supplier_id} 
                            onValueChange={(val) => setNewItemPayload({ ...newItemPayload, supplier_id: val })}
                          >
                            <SelectTrigger id="supplier_id">
                              <SelectValue placeholder="Seleccione el proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliersList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {activeCatalog === "functional_principles" && (
                <div className="space-y-4 mt-6">
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4 text-[10px] sm:text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> texto: {counts.text}/10
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" /> número entero: {counts.integer}/5
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500" /> con decimales: {counts.decimal}/5
                      </span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addProperty} disabled={properties.length >= 20}>
                      <Plus className="size-3.5 mr-1" /> Propiedad
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {properties.map((p, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input 
                          value={p.name} 
                          onChange={(e) => updateProperty(index, "name", e.target.value)} 
                          placeholder="Nombre de propiedad" 
                          className="flex-1 min-w-[100px]" 
                          required
                        />
                        <Select value={p.type} onValueChange={(v: any) => updateProperty(index, "type", v)}>
                          <SelectTrigger className="w-[140px] sm:w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text" disabled={p.type !== "text" && counts.text >= 10}>Texto</SelectItem>
                            <SelectItem value="integer" disabled={p.type !== "integer" && counts.integer >= 5}>Número Entero</SelectItem>
                            <SelectItem value="decimal" disabled={p.type !== "decimal" && counts.decimal >= 5}>Con Decimales</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeProperty(index)}>
                          <Trash className="size-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-red-500 font-medium">{error}</div>}

      <Tabs defaultValue="companies" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="companies">Compañías</TabsTrigger>
          <TabsTrigger value="locations">Locaciones</TabsTrigger>
          <TabsTrigger value="functional_principles">Principios Funcionales</TabsTrigger>
          <TabsTrigger value="ubications">Ubicaciones</TabsTrigger>
          <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
          <TabsTrigger value="wells">Pozos</TabsTrigger>
        </TabsList>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    Cargando catálogos...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No hay elementos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(item.id)}>
                        <Copy className="size-3.5 mr-1" />
                        Copiar ID
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>
    </div>
  );
}
