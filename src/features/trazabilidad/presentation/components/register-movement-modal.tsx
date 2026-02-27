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
import { Asset } from "../../domain/entities";

interface Props {
  asset: Asset;
  onRegister: (assetId: string, movement: any) => Promise<void>;
}

export function RegisterMovementModal({ asset, onRegister }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [type, setType] = useState("");
  const [responsible, setResponsible] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onRegister(asset.id, {
        destination,
        type,
        responsible,
        comments,
      });
      setOpen(false);
      // Reset form
      setDestination("");
      setType("");
      setResponsible("");
      setComments("");
    } catch (error) {
      console.error("Error registering movement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground font-semibold">
          Registrar Movimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">
            Registrar Movimiento
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Actualiza la ubicación y estado del activo {asset.code}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Ubicación Origen
            </Label>
            <Input
              value={asset.currentLocation}
              disabled
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="destination"
              className="text-xs uppercase tracking-widest text-muted-foreground"
            >
              Ubicación Destino
            </Label>
            <Select value={destination} onValueChange={setDestination} required>
              <SelectTrigger
                id="destination"
                className="bg-secondary/20 border-border h-11"
              >
                <SelectValue placeholder="Seleccione destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RIG 702">RIG 702</SelectItem>
                <SelectItem value="RIG 703">RIG 703</SelectItem>
                <SelectItem value="Base Proveedor">Base Proveedor</SelectItem>
                <SelectItem value="Base Operativa Norte">
                  Base Operativa Norte
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="type"
              className="text-xs uppercase tracking-widest text-muted-foreground"
            >
              Tipo de Movimiento
            </Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger
                id="type"
                className="bg-secondary/20 border-border h-11"
              >
                <SelectValue placeholder="Tipo de traslado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Traslado">Traslado</SelectItem>
                <SelectItem value="Instalación">Instalación</SelectItem>
                <SelectItem value="Retiro">Retiro</SelectItem>
                <SelectItem value="Envío Proveedor">Envío Proveedor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="responsible"
              className="text-xs uppercase tracking-widest text-muted-foreground"
            >
              Responsable
            </Label>
            <Input
              id="responsible"
              placeholder="Nombre del encargado"
              className="bg-secondary/20 border-border h-11"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="comments"
              className="text-xs uppercase tracking-widest text-muted-foreground"
            >
              Comentarios
            </Label>
            <Input
              id="comments"
              placeholder="Notas adicionales..."
              className="bg-secondary/20 border-border h-11"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <DialogFooter>
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
              className="min-w-[120px]"
            >
              {isLoading ? "Registrando..." : "Confirmar Movimiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
