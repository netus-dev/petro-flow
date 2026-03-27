"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/core/presentation/components/ui/dialog";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
import { Plus } from "lucide-react";
import { Asset } from "../../domain/entities";
import { catalogsRepository } from "@/src/features/catalogs/infrastructure/repository";
import { useEffect } from "react";

interface Props {
  onRegister: (asset: Partial<Asset>) => Promise<void>;
}

export function RegisterAssetModal({ onRegister }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [functionalPrinciples, setFunctionalPrinciples] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [ubications, setUbications] = useState<any[]>([]);

  const initialFormState = {
    brand: "",
    model: "",
    capacity: "",
    serial_number: "",
    last_inspection_code: "",
    status: "active",
    current_location_id: "",
    current_ubication_id: "",
    function_principle_id: "",
  };

  const [formData, setFormData] = useState<any>(initialFormState);

  useEffect(() => {
    if (open) {
      Promise.all([
        catalogsRepository.getItems("functional_principles"),
        catalogsRepository.getItems("locations"),
        catalogsRepository.getItems("ubications"),
      ])
        .then(([fps, locs, ubis]) => {
          setFunctionalPrinciples(fps);
          setLocations(locs);
          setUbications(ubis);
        })
        .catch(console.error);
    } else {
      setFormData(initialFormState);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onRegister(formData as any);
      setOpen(false);
    } catch (error) {
      console.error("Error registering asset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedFnPrinciple = functionalPrinciples.find(
    (p) => p.id === formData.function_principle_id
  );
  const propertyKeys = Array.from({ length: 20 }, (_, i) => `property_${i + 1}`);
  const activeProperties = selectedFnPrinciple
    ? propertyKeys.filter((k) => selectedFnPrinciple[k])
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-border border-dashed font-mono uppercase text-[10px] tracking-wider"
        >
          <Plus className="size-3.5" />
          Registrar Activo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">
            Registrar Nuevo Activo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ingrese los detalles técnicos para dar de alta un nuevo activo en el
            sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 1. Marca */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="brand" className="text-xs uppercase tracking-widest text-muted-foreground">
                Marca
              </Label>
              <Input
                id="brand"
                placeholder="Ej: Schlumberger"
                className="bg-secondary/20 border-border h-11"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            {/* 2. Modelo */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="model" className="text-xs uppercase tracking-widest text-muted-foreground">
                Modelo
              </Label>
              <Input
                id="model"
                placeholder="Ej: VAM21"
                className="bg-secondary/20 border-border h-11"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 3. Capacidad */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="capacity" className="text-xs uppercase tracking-widest text-muted-foreground">
                Capacidad
              </Label>
              <Input
                id="capacity"
                placeholder="Ej: 5000 PSI"
                className="bg-secondary/20 border-border h-11"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            {/* 4. Número de serie */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="serial_number" className="text-xs uppercase tracking-widest text-muted-foreground">
                Número de Serie
              </Label>
              <Input
                id="serial_number"
                placeholder="SN-XXXXXX"
                className="bg-secondary/20 border-border h-11"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 5. Cód. últ. inspección */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="last_inspection_code" className="text-xs uppercase tracking-widest text-muted-foreground">
                Cód. Última Inspección
              </Label>
              <Input
                id="last_inspection_code"
                placeholder="Ej: INSP-01"
                className="bg-secondary/20 border-border h-11"
                value={formData.last_inspection_code}
                onChange={(e) => setFormData({ ...formData, last_inspection_code: e.target.value })}
                required
              />
            </div>
            {/* 6. Estado operativo */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="status" className="text-xs uppercase tracking-widest text-muted-foreground">
                Estado Operativo
              </Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })} required>
                <SelectTrigger id="status" className="bg-secondary/20 border-border h-11">
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="under_inspection">En Inspección</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 7. Locación actual */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="current_location" className="text-xs uppercase tracking-widest text-muted-foreground">
                Locación Actual
              </Label>
              <Select value={formData.current_location_id} onValueChange={(v) => setFormData({ ...formData, current_location_id: v })} required>
                <SelectTrigger id="current_location" className="bg-secondary/20 border-border h-11">
                  <SelectValue placeholder="Seleccione locación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* 8. Posición actual */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="current_ubication" className="text-xs uppercase tracking-widest text-muted-foreground">
                Posición Actual
              </Label>
              <Select value={formData.current_ubication_id} onValueChange={(v) => setFormData({ ...formData, current_ubication_id: v })} required>
                <SelectTrigger id="current_ubication" className="bg-secondary/20 border-border h-11">
                  <SelectValue placeholder="Seleccione ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {ubications.map((ubi) => (
                    <SelectItem key={ubi.id} value={ubi.id}>{ubi.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 9. Principio funcional */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="function_principle" className="text-xs uppercase tracking-widest text-muted-foreground">
              Principio Funcional
            </Label>
            <Select value={formData.function_principle_id} onValueChange={(v) => setFormData({ ...formData, function_principle_id: v })} required>
              <SelectTrigger id="function_principle" className="bg-secondary/20 border-border h-11">
                <SelectValue placeholder="Seleccione principio" />
              </SelectTrigger>
              <SelectContent>
                {functionalPrinciples.map((fp) => (
                  <SelectItem key={fp.id} value={fp.id}>{fp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 10. Propiedades Especiales (Dinámicas) */}
          {formData.function_principle_id && (
            <div className="bg-secondary/10 p-4 rounded-md border border-border">
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
                Especificaciones Adicionales
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {activeProperties.length > 0 ? (
                  activeProperties.map((key) => (
                    <div key={key} className="flex flex-col gap-2">
                      <Label htmlFor={key} className="text-xs uppercase tracking-widest text-muted-foreground">
                        {selectedFnPrinciple[key]}
                      </Label>
                      <Input
                        id={key}
                        className="bg-secondary/20 border-border h-11"
                        value={formData[key] || ""}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        required
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic col-span-2">
                    No hay parámetros específicos configurados para este principio funcional.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="border border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[150px]"
            >
              {isLoading ? "Registrando..." : "Registrar Activo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
