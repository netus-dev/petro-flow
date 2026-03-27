"use client";

import { useEffect, useState } from "react";
import { useCatalogs } from "../hooks/use-catalogs";
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

export function CatalogsContent() {
  const { 
    activeCatalog, items, loading, error, 
    handleTabChange, loadItems, createItem, updateItem, deleteItem 
  } = useCatalogs();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [newItemPayload, setNewItemPayload] = useState<{ name: string; type?: string }>({ name: "" });

  useEffect(() => {
    loadItems("companies");
  }, [loadItems]);

  const openCreateDialog = () => {
    setEditItemId(null);
    setNewItemPayload({ name: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: BaseCatalogItem) => {
    setEditItemId(item.id);
    setNewItemPayload({ name: item.name, type: item.type });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!newItemPayload.name.trim()) return;
    
    // Validar fields obligatorios por catálogo
    if (activeCatalog === "locations" && !newItemPayload.type) return;

    if (editItemId) {
      await updateItem(editItemId, newItemPayload);
    } else {
      await createItem(newItemPayload);
    }
    
    setNewItemPayload({ name: "" });
    setEditItemId(null);
    setIsDialogOpen(false);
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

              {activeCatalog === "locations" && (
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
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Cargando catálogos...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No hay elementos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.id.split('-')[0]}...
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right space-x-2">
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
