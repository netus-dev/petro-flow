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

export function CatalogsContent() {
  const { 
    activeCatalog, items, loading, error, 
    handleTabChange, loadItems, createItem, deleteItem 
  } = useCatalogs();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    loadItems("locations");
  }, [loadItems]);

  const handleCreate = async () => {
    if (!newItemName.trim()) return;
    await createItem({ name: newItemName });
    setNewItemName("");
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Agregar Elemento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Elemento ({activeCatalog})</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name" 
                  value={newItemName} 
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ej. RIG 702, Tubular, etc." 
                />
              </div>
              <Button onClick={handleCreate} disabled={loading} className="w-full">
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-red-500 font-medium">{error}</div>}

      <Tabs defaultValue="locations" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="locations">Locaciones</TabsTrigger>
          <TabsTrigger value="ubications">Ubicaciones</TabsTrigger>
          <TabsTrigger value="functional_principles">Principios Funcionales</TabsTrigger>
          <TabsTrigger value="companies">Compañías</TabsTrigger>
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
