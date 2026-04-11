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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/core/presentation/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/core/presentation/components/ui/command";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/src/core/utils/utils";
import { Asset } from "../../domain/entities";
import { catalogsRepository } from "@/src/features/catalogs/infrastructure/repository";
import { useEffect } from "react";
import { useAuthStore } from "@/src/features/auth/presentation/store/auth-store";

interface Props {
  mode?: "create" | "edit";
  assetToEdit?: Asset;
  onRegister?: (asset: Partial<Asset>) => Promise<void>;
  onEdit?: (id: string, asset: Partial<Asset>) => Promise<void>;
  trigger?: React.ReactNode;
}

export function RegisterAssetModal({ mode = "create", assetToEdit, onRegister, onEdit, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [functionalPrinciples, setFunctionalPrinciples] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [ubications, setUbications] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);

  const company_id = useAuthStore( state => state.profile?.company?.id );

  const [brandOpen, setBrandOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  const initialFormState = mode === "edit" && assetToEdit ? {
    brand_id: assetToEdit.brand_id || assetToEdit.brand,
    model_id: assetToEdit.model_id || assetToEdit.model,
    capacity: assetToEdit.capacity || "",
    serial_number: assetToEdit.serialNumber || "",
    last_inspection_code: assetToEdit.lastInspectionCode || "",
    status: assetToEdit.status,
    current_location_id: assetToEdit.current_location_id || "",
    current_ubication_id: assetToEdit.current_ubication_id || "",
    function_principle_id: assetToEdit.function_principle_id || "",
    ...assetToEdit.properties?.reduce((acc: any, prop: any) => {
      acc[prop.key] = prop.value;
      return acc;
    }, {})
  } : {
    brand_id: "",
    model_id: "",
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
      console.log("company_id:", company_id);
      Promise.all([
        catalogsRepository.getItems("functional_principles", company_id),
        catalogsRepository.getItems("locations", company_id),
        catalogsRepository.getItems("ubications", company_id),
        catalogsRepository.getItems("brands", company_id),
        catalogsRepository.getItems("models", company_id),
      ])
        .then(([fps, locs, ubis, brs, mods]) => {
          setFunctionalPrinciples(fps);
          setLocations(locs);
          setUbications(ubis);
          setBrands(brs);
          setModels(mods);
        })
        .catch(console.error);
    } else {
      setFormData(initialFormState);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company_id) {
      alert("No se pudo determinar la compañía del usuario. Por favor, intente iniciar sesión de nuevo.");
      return;
    }

    setIsLoading(true);
    try {
      let finalBrandId = formData.brand_id;
      let finalModelId = formData.model_id;

      let isNewBrand = false;
      if (finalBrandId && !brands.find(b => b.id === finalBrandId)) {
        const newBrand = await catalogsRepository.createItem("brands", { name: finalBrandId, is_active: true, company_id: company_id });
        finalBrandId = newBrand.id;
        isNewBrand = true;
      }

      if (finalModelId && !models.find(m => m.id === finalModelId)) {
        const newModel = await catalogsRepository.createItem("models", { 
          name: finalModelId, 
          brand_id: finalBrandId, 
          company_id: company_id,
          is_active: true 
        });
        finalModelId = newModel.id;
      }

      const payloadToSave = { 
        ...formData, 
        brand_id: finalBrandId, 
        model_id: finalModelId,
        company_id: company_id
      };

      if (mode === "edit" && onEdit && assetToEdit) {
        await onEdit(assetToEdit.id, payloadToSave as any);
      } else if (onRegister) {
        await onRegister(payloadToSave as any);
      }
      
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
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-border border-dashed font-mono uppercase text-[10px] tracking-wider"
          >
            <Plus className="size-3.5" />
            Registrar Activo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">
            {mode === "create" ? "Registrar Nuevo Activo" : "Editar Activo"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "create" 
              ? "Ingrese los detalles técnicos para dar de alta un nuevo activo en el sistema." 
              : "Modifique los detalles técnicos del activo. El principio funcional principal no puede ser alterado."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 1. Marca */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="brand_id" className="text-xs uppercase tracking-widest text-muted-foreground">
                Marca
              </Label>
              <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="justify-between bg-secondary/20 border-border h-11 font-normal w-full"
                  >
                    {formData.brand_id
                      ? brands.find((b) => b.id === formData.brand_id)?.name || formData.brand_id
                      : "Seleccione marca"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 z-[100] w-[--radix-popover-trigger-width]">
                  <Command>
                    <CommandInput placeholder="Buscar marca..." value={brandSearch} onValueChange={setBrandSearch} />
                    <CommandList>
                      <CommandEmpty className="py-2 text-center text-sm px-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start font-normal h-auto py-2 whitespace-normal text-left"
                          onClick={() => {
                            setFormData({ ...formData, brand_id: brandSearch, model_id: "" });
                            setBrandOpen(false);
                          }}
                        >
                          Se guardará como nueva marca: <span className="font-semibold ml-1 block truncate">{brandSearch}</span>
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {brands.filter(b => b.is_active !== false).map((b) => (
                          <CommandItem
                            key={b.id}
                            value={b.name}
                            onSelect={() => {
                              setFormData({ ...formData, brand_id: b.id, model_id: "" });
                              setBrandOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.brand_id === b.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {b.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {/* 2. Modelo */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="model_id" className="text-xs uppercase tracking-widest text-muted-foreground">
                Modelo
              </Label>
              <Popover open={modelOpen} onOpenChange={setModelOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={!formData.brand_id}
                    className="justify-between bg-secondary/20 border-border h-11 font-normal w-full"
                  >
                    {formData.model_id
                      ? models.find((m) => m.id === formData.model_id)?.name || formData.model_id
                      : "Seleccione modelo"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 z-[100] w-[--radix-popover-trigger-width]">
                  <Command>
                    <CommandInput placeholder="Buscar modelo..." value={modelSearch} onValueChange={setModelSearch} />
                    <CommandList>
                      <CommandEmpty className="py-2 text-center text-sm px-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start font-normal h-auto py-2 whitespace-normal text-left"
                          onClick={() => {
                            setFormData({ ...formData, model_id: modelSearch });
                            setModelOpen(false);
                          }}
                        >
                          Se guardará como nuevo modelo: <span className="font-semibold ml-1 block truncate">{modelSearch}</span>
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {models.filter(m => m.brand_id === formData.brand_id && m.is_active !== false).map((m) => (
                          <CommandItem
                            key={m.id}
                            value={m.name}
                            onSelect={() => {
                              setFormData({ ...formData, model_id: m.id });
                              setModelOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.model_id === m.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {m.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                  <SelectItem value="active">Operativo</SelectItem>
                  <SelectItem value="under_inspection">Para inspección</SelectItem>
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
            <Select value={formData.function_principle_id} onValueChange={(v) => setFormData({ ...formData, function_principle_id: v })} required disabled={mode === "edit"}>
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
              {isLoading ? "Guardando..." : mode === "create" ? "Registrar Activo" : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
