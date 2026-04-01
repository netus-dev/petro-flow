"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Asset, AssetMovementPayload, TransactionType } from "../../domain/entities";
import { catalogsRepository } from "@/src/features/catalogs/infrastructure/repository";
import { Checkbox } from "@/src/core/presentation/components/ui/checkbox";
import { FileUp, Shuffle, Info, Search } from "lucide-react";

interface Props {
  assets: Asset[];
  onRegister: (payload: AssetMovementPayload) => Promise<void>;
}

export function RegisterBatchMovementModal({ assets, onRegister }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [type, setType] = useState<TransactionType | "">("");
  const [originLocation, setOriginLocation] = useState("");
  const [originUbication, setOriginUbication] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [destinationUbication, setDestinationUbication] = useState("");
  const [justification, setJustification] = useState("");

  // Table State
  const [search, setSearch] = useState("");
  const [filterPrinciple, setFilterPrinciple] = useState("all");
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, string>>({});

  // Catalogs
  const [locations, setLocations] = useState<any[]>([]);
  const [ubications, setUbications] = useState<any[]>([]);
  const [functionalPrinciples, setFunctionalPrinciples] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      Promise.all([
        catalogsRepository.getItems("locations"),
        catalogsRepository.getItems("ubications"),
        catalogsRepository.getItems("functional_principles"),
      ])
        .then(([locs, ubis, fps]) => {
          setLocations(locs);
          setUbications(ubis);
          setFunctionalPrinciples(fps);
        })
        .catch(console.error);
    } else {
      resetForm();
    }
  }, [open]);

  const handleNextStep = () => {
    if (!type || !originLocation || !justification) return;
    if (type === "transfer" && !destinationLocation) return;
    if (type === "reubication" && (!originUbication || !destinationUbication)) return;
    
    setStep(2);
  };

  const handleConfirm = async () => {
    if (selectedAssetIds.size === 0) return;
    
    setIsLoading(true);
    try {
      const payloadAssets = Array.from(selectedAssetIds).map((id) => ({
        asset_id: id,
        comments: commentsMap[id] || "",
      }));

      const payload: AssetMovementPayload = {
        type: type as TransactionType,
        origin_location_id: originLocation,
        justification,
        assets: payloadAssets,
      };

      if (type === "transfer") {
        payload.destination_location_id = destinationLocation;
      } else {
        payload.destination_ubication_id = destinationUbication;
      }

      await onRegister(payload);
      
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error registering bulk movement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setType("");
    setOriginLocation("");
    setOriginUbication("");
    setDestinationLocation("");
    setDestinationUbication("");
    setJustification("");
    setSearch("");
    setFilterPrinciple("all");
    setSelectedAssetIds(new Set());
    setCommentsMap({});
  };

  // Extract the "Patio" ubication logic for the origin if transfer, or specific ubication if reubication.
  const patioUbication = useMemo(() => {
    return ubications.find(u => u.name.toLowerCase().includes("patio"));
  }, [ubications]);

  const availableAssets = useMemo(() => {
    if (step !== 2) return [];

    let filtered = assets.filter((a) => {
      // Must be active to be moved
      if (a.is_active === false) return false;

      // Must be at the origin location
      if (a.current_location_id !== originLocation) return false;

      // Type-specific ubication requirement
      if (type === "transfer") {
        // Must be in "patio"
        if (patioUbication && a.current_ubication_id !== patioUbication.id && a.position?.toLowerCase() !== 'patio') {
          return false;
        }
      } else {
        // Reubication restricts to originUbication
        if (a.current_ubication_id !== originUbication) return false;
      }

      // Principle Filter
      if (filterPrinciple !== "all" && a.function_principle_id !== filterPrinciple && a.functionalPrinciple !== filterPrinciple) {
        return false;
      }

      // Search Filter
      if (search) {
        const query = search.toLowerCase();
        return (
          a.code.toLowerCase().includes(query) ||
          a.name.toLowerCase().includes(query) ||
          a.serialNumber.toLowerCase().includes(query)
        );
      }

      return true;
    });

    return filtered;
  }, [assets, step, originLocation, originUbication, type, filterPrinciple, search, patioUbication]);


  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2 h-9">
          <Shuffle className="size-4" />
          Registrar Movimiento
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[800px] bg-card border-border p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 border-b border-border bg-secondary/10">
          <DialogTitle className="font-mono text-xl">Registrar Movimiento</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Mueve multiples activos entre locaciones y/o ubicaciones.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {step === 1 ? (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col gap-3">
                <Label>Tipo de Movimiento</Label>
                <Select value={type} onValueChange={(val: "transfer" | "reubication") => {
                  setType(val);
                  setDestinationLocation("");
                  setDestinationUbication("");
                  setOriginUbication("");
                }}>
                  <SelectTrigger className="bg-secondary/20 h-11 border-border">
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">Transferencia</span>
                        <span className="text-xs text-muted-foreground font-mono">Movimiento hacia otra locación.</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="reubication">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">Reubicación</span>
                        <span className="text-xs text-muted-foreground font-mono">Movimiento dentro de la misma locación.</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {type && (
                  <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 p-3 rounded-md mt-1">
                    <Info className="size-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary/80 font-mono leading-relaxed">
                      {type === "transfer" 
                        ? "La transferencia aplica cuando se mueven activos a otra locación. Todos los activos deben encontrarse actualmente en la ubicación 'Patio' de la locación origen, y se destinarán automáticamente al 'Patio' de la locación destino." 
                        : "La reubicación aplica cuando los activos cambian de espacio dentro de su lugar actual. Se registran en la bitácora para control interno."}
                    </p>
                  </div>
                )}
              </div>

              {type && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Locación Origen</Label>
                    <Select value={originLocation} onValueChange={setOriginLocation}>
                      <SelectTrigger className="bg-secondary/20 h-10 border-border">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.filter((l: any) => l.is_active).map((l: any) => (
                          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {type === "reubication" ? (
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ubicación Origen</Label>
                      <Select value={originUbication} onValueChange={setOriginUbication}>
                        <SelectTrigger className="bg-secondary/20 h-10 border-border">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {ubications.filter((u: any) => u.is_active).map((u: any) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Locación Destino</Label>
                      <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                        <SelectTrigger className="bg-secondary/20 h-10 border-border">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.filter(l => l.is_active && l.id !== originLocation).map(l => (
                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {type === "reubication" && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Ubicación Destino</Label>
                      <Select value={destinationUbication} onValueChange={setDestinationUbication}>
                        <SelectTrigger className="bg-secondary/20 h-10 border-border">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {ubications.filter(u => u.is_active && u.id !== originUbication).map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {type && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Justificación <span className="text-destructive">*</span></Label>
                  <Input 
                    value={justification} 
                    onChange={e => setJustification(e.target.value)} 
                    placeholder="Motivo del movimiento..."
                    className="bg-secondary/20 border-border h-11"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 h-full">
              <div className="flex items-center gap-3 bg-secondary/20 p-3 rounded-lg border border-border">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por código, S/N o nombre..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 bg-background/50 border-border"
                  />
                </div>
                <Select value={filterPrinciple} onValueChange={setFilterPrinciple}>
                  <SelectTrigger className="w-[180px] h-9 bg-background/50 border-border">
                    <SelectValue placeholder="Principio Funcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {functionalPrinciples.map((fp: any) => (
                      <SelectItem key={fp.id} value={fp.id}>{fp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border border-border overflow-hidden flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 sticky top-0 backdrop-blur-md z-10 border-b border-border font-mono uppercase tracking-wider text-[10px] text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium w-10">
                        <Checkbox 
                           checked={availableAssets.length > 0 && selectedAssetIds.size === availableAssets.length}
                           onCheckedChange={(checked: boolean | "indeterminate") => {
                             if (checked === true) {
                               setSelectedAssetIds(new Set(availableAssets.map(a => a.id)));
                             } else {
                               setSelectedAssetIds(new Set());
                             }
                           }}
                        />
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Código</th>
                      <th className="py-3 px-4 text-left font-medium">Principio F.</th>
                      <th className="py-3 px-4 text-left font-medium">No. Serie</th>
                      <th className="py-3 px-4 text-left font-medium">Estado</th>
                      <th className="py-3 px-4 text-left font-medium">Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableAssets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12  text-center text-muted-foreground font-mono text-xs">
                          {type === "transfer" 
                            ? "No hay activos disponibles en el patio de la locación origen." 
                            : "No hay activos disponibles en la ubicación origen."}
                        </td>
                      </tr>
                    ) : (
                      availableAssets.map((a) => (
                        <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                          <td className="py-3 px-4">
                            <Checkbox 
                              checked={selectedAssetIds.has(a.id)}
                              onCheckedChange={(checked: boolean | "indeterminate") => {
                                const newSet = new Set(selectedAssetIds);
                                if (checked === true) newSet.add(a.id);
                                else newSet.delete(a.id);
                                setSelectedAssetIds(newSet);
                              }}
                            />
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-foreground">{a.code}</td>
                          <td className="py-3 px-4 text-muted-foreground">{a.type || a.functionalPrinciple}</td>
                          <td className="py-3 px-4 font-mono text-muted-foreground text-xs">{a.serialNumber}</td>
                          <td className="py-3 px-4">
                             <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-primary/10 text-primary uppercase font-mono tracking-wider">
                                {a.status}
                             </span>
                          </td>
                          <td className="py-2 px-4">
                            <Input 
                              placeholder="Opcional..."
                              value={commentsMap[a.id] || ""}
                              onChange={e => setCommentsMap(prev => ({...prev, [a.id]: e.target.value}))}
                              className="h-8 text-xs bg-background/50 border-border"
                              disabled={!selectedAssetIds.has(a.id)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t border-border bg-secondary/10">
          <Button variant="ghost" className="border border-border" onClick={() => {
            if (step === 2) setStep(1);
            else setOpen(false);
          }}>
            {step === 2 ? "Atrás" : "Cancelar"}
          </Button>
          
          {step === 1 ? (
             <Button onClick={handleNextStep} disabled={!type || !originLocation || !justification || (type === "transfer" && !destinationLocation) || (type === "reubication" && (!originUbication || !destinationUbication))}>
               Siguiente <Shuffle className="size-4 ml-2" />
             </Button>
          ) : (
            <Button 
               disabled={selectedAssetIds.size === 0 || isLoading} 
               onClick={handleConfirm}
               className="gap-2 font-semibold"
            >
              {isLoading ? "Guardando..." : "Confirmar Selección"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
