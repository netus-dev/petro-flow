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
import { Asset, ReplacementMovementPayload } from "../../domain/entities";
import { catalogsRepository } from "@/src/features/catalogs/infrastructure/repository";
import { ArrowLeftRight, Search, Info } from "lucide-react";
import { useTrazabilidad } from "../../presentation/hooks/use-trazabilidad";

interface Props {
  asset: Asset; // The asset triggering the modal
  onRegister: (payload: ReplacementMovementPayload) => Promise<void>;
}

export function RegisterReplacementModal({ asset, onRegister }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { assetList } = useTrazabilidad();

  // Form State
  const [role, setRole] = useState<"assetB" | "assetA">("assetB"); // assetB = Es el activo que será reemplazado. assetA = Es el nuevo componente que reemplazará a otro.
  const [otherAssetId, setOtherAssetId] = useState("");
  const [destinationUbication, setDestinationUbication] = useState("");
  const [justification, setJustification] = useState("");
  const [search, setSearch] = useState("");

  const [ubications, setUbications] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      catalogsRepository.getItems("ubications")
        .then(setUbications)
        .catch(console.error);

      setRole("assetB"); // Default role
    } else {
      setRole("assetB");
      setOtherAssetId("");
      setDestinationUbication("");
      setJustification("");
      setSearch("");
    }
  }, [open]);

  // Current asset is asset B? Its current location MUST have allow_multi_assets === false
  // Current asset is asset A? Its current location can be anything.
  // But wait, it's easier to just compute `assetA` and `assetB` variables based on role.
  const _assetA = role === "assetA" ? asset : assetList.find(a => a.id === otherAssetId);
  const _assetB = role === "assetB" ? asset : assetList.find(a => a.id === otherAssetId);

  const availableOtherAssets = useMemo(() => {
    return assetList.filter((a) => {
      if (a.id === asset.id) return false;
      if (a.is_active === false) return false;
      if (a.current_location_id !== asset.current_location_id) return false;
      if (a.function_principle_id !== asset.function_principle_id) return false;

      // If the current asset is A (new), then we are looking for B (to replace). B MUST be in a non-multi-asset ubication.
      if (role === "assetA") {
         const ubi = ubications.find(u => u.id === a.current_ubication_id);
         if (!ubi || ubi.allow_multi_assets) return false;
      }
      
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
  }, [assetList, asset, role, search, ubications]);

  // Destination for B must always be a multi-asset location
  const multiAssetUbications = useMemo(() => {
    return ubications.filter((u) => u.allow_multi_assets && u.is_active);
  }, [ubications]);

  const handleConfirm = async () => {
    if (!otherAssetId || !destinationUbication || !justification) return;
    
    setIsLoading(true);
    try {
      const payload: ReplacementMovementPayload = {
        type: "replacement",
        location_id: asset.current_location_id!,
        asset_a_id: _assetA!.id,
        asset_b_id: _assetB!.id,
        asset_b_destination_ubication_id: destinationUbication,
        justification,
      };

      await onRegister(payload);
      setOpen(false);
    } catch (error) {
      console.error("Error registering replacement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2 h-10 border-border bg-secondary/50 hover:bg-secondary">
          <ArrowLeftRight className="size-4" />
          Registrar Reemplazo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[600px] bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-secondary/10 shrink-0">
          <DialogTitle className="font-mono text-xl flex items-center gap-2">
            <ArrowLeftRight className="size-5 text-primary" />
            Registrar Reemplazo
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Realiza un intercambio 1 a 1 entre componentes del mismo tipo en esta locación.
          </p>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6">
          {/* Identity Toggle */}
           <div className="flex flex-col gap-2">
             <Label className="text-xs uppercase tracking-widest text-muted-foreground">Rol de este activo ({asset.code})</Label>
             <Select value={role} onValueChange={(val: any) => { setRole(val); setOtherAssetId(""); }}>
               <SelectTrigger className="bg-secondary/20 h-11 border-border font-medium">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="assetB">Es el activo que será reemplazado (Activo B)</SelectItem>
                 <SelectItem value="assetA">Es el componente nuevo a instalar (Activo A)</SelectItem>
               </SelectContent>
             </Select>
           </div>

           <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 p-3 rounded-md">
             <Info className="size-4 text-primary shrink-0 mt-0.5" />
             <p className="text-xs text-primary/80 font-mono leading-relaxed">
               {role === "assetB" 
                 ? "Este activo será reemplazado por uno nuevo, y posteriormente se moverá al destino indicado."
                 : "Este activo se instalará en el lugar de un activo actualmente operativo. El activo reemplazado será movido al destino indicado."}
             </p>
           </div>

           {role === "assetB" && (
              <div className="text-xs text-orange-500 font-medium">
                 {ubications.find(u => u.id === asset.current_ubication_id)?.allow_multi_assets === true 
                   ? "Atención: Este activo se encuentra actualmente en una ubicación multi-activo. Usualmente solo se reemplazan activos en ubicaciones operacionales." 
                   : ""}
              </div>
           )}

           <div className="flex flex-col gap-2">
             <Label className="text-xs uppercase tracking-widest text-muted-foreground">
               {role === "assetB" ? "Seleccionar el Nuevo Componente (Activo A)" : "Seleccionar Activo a Reemplazar (Activo B)"}
             </Label>
             <div className="relative mb-2">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
               <Input 
                 placeholder="Filtrar por código o serie..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-9 h-9 bg-background/50 border-border"
               />
             </div>
             <Select value={otherAssetId} onValueChange={setOtherAssetId}>
               <SelectTrigger className="bg-secondary/20 h-10 border-border">
                 <SelectValue placeholder="Seleccione el activo..." />
               </SelectTrigger>
               <SelectContent>
                 {availableOtherAssets.map((a) => (
                   <SelectItem key={a.id} value={a.id}>{a.code} — {a.serialNumber}</SelectItem>
                 ))}
                 {availableOtherAssets.length === 0 && (
                   <div className="p-2 text-xs text-muted-foreground text-center">No hay activos compatibles.</div>
                 )}
               </SelectContent>
             </Select>
           </div>

           {/* Destination of the replaced asset */}
           <div className="flex flex-col gap-2">
             <Label className="text-xs uppercase tracking-widest text-muted-foreground">Destino del activo reemplazado ({role === "assetB" ? asset.code : (_assetB?.code || "Activo B")})</Label>
             <Select value={destinationUbication} onValueChange={setDestinationUbication}>
               <SelectTrigger className="bg-secondary/20 h-10 border-border">
                 <SelectValue placeholder="Ubicación multi-activo" />
               </SelectTrigger>
               <SelectContent>
                 {multiAssetUbications.map((u) => (
                   <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

           <div className="flex flex-col gap-2">
             <Label className="text-xs uppercase tracking-widest text-muted-foreground">Justificación <span className="text-destructive">*</span></Label>
             <Input 
               value={justification} 
               onChange={e => setJustification(e.target.value)} 
               placeholder="Motivo del reemplazo..."
               className="bg-secondary/20 border-border h-11"
             />
           </div>

        </div>

        <DialogFooter className="p-6 border-t border-border bg-secondary/10 shrink-0">
          <Button variant="ghost" className="border border-border" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
             disabled={!otherAssetId || !destinationUbication || !justification || isLoading} 
             onClick={handleConfirm}
             className="gap-2 font-semibold"
          >
            {isLoading ? "Iniciando..." : "Confirmar Reemplazo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
