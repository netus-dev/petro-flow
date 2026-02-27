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
import { Asset, FunctionalPrinciple, AssetStatus } from "../../domain/entities";

interface Props {
  onRegister: (asset: Partial<Asset>) => Promise<void>;
}

export function RegisterAssetModal({ onRegister }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    functionalPrinciple: "Tubular" as FunctionalPrinciple,
    brand: "",
    model: "",
    serialNumber: "",
    currentLocation: "Base Proveedor",
    status: "Operativo" as AssetStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onRegister(formData);
      setOpen(false);
      // Reset form
      setFormData({
        code: "",
        functionalPrinciple: "Tubular",
        brand: "",
        model: "",
        serialNumber: "",
        currentLocation: "Base Proveedor",
        status: "Operativo",
      });
    } catch (error) {
      console.error("Error registering asset:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="code"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Código de Activo
              </Label>
              <Input
                id="code"
                placeholder="Ej: TUB-702-XXX"
                className="bg-secondary/20 border-border h-11"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="serialNumber"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Número de Serie
              </Label>
              <Input
                id="serialNumber"
                placeholder="SN-XXXXXX"
                className="bg-secondary/20 border-border h-11"
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData({ ...formData, serialNumber: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="brand"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Marca
              </Label>
              <Input
                id="brand"
                placeholder="Ej: VAM, Schlumberger"
                className="bg-secondary/20 border-border h-11"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="model"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Modelo
              </Label>
              <Input
                id="model"
                placeholder="Ej: VAM21"
                className="bg-secondary/20 border-border h-11"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="principle"
              className="text-xs uppercase tracking-widest text-muted-foreground"
            >
              Principio Funcional
            </Label>
            <Select
              value={formData.functionalPrinciple}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  functionalPrinciple: v as FunctionalPrinciple,
                })
              }
            >
              <SelectTrigger
                id="principle"
                className="bg-secondary/20 border-border h-11"
              >
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tubular">Tubular</SelectItem>
                <SelectItem value="Herramienta">Herramienta</SelectItem>
                <SelectItem value="Componente">Componente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="location"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Ubicación Inicial
              </Label>
              <Select
                value={formData.currentLocation}
                onValueChange={(v) =>
                  setFormData({ ...formData, currentLocation: v })
                }
              >
                <SelectTrigger
                  id="location"
                  className="bg-secondary/20 border-border h-11"
                >
                  <SelectValue placeholder="Seleccione ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Base Proveedor">Base Proveedor</SelectItem>
                  <SelectItem value="RIG 702">RIG 702</SelectItem>
                  <SelectItem value="RIG 703">RIG 703</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="status"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Estado Inicial
              </Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as AssetStatus })
                }
              >
                <SelectTrigger
                  id="status"
                  className="bg-secondary/20 border-border h-11"
                >
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operativo">Operativo</SelectItem>
                  <SelectItem value="En mantenimiento">
                    En mantenimiento
                  </SelectItem>
                  <SelectItem value="En tránsito">En tránsito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
