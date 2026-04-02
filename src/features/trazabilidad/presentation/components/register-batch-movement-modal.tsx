"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import { FileUp, Shuffle, Info, Search, Upload, FileText, Image as ImageIcon, X, AlertCircle } from "lucide-react";

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

  // Certificates State
  const [certificates, setCertificates] = useState<{ id: string; file: File; name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

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

  // Certificates Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateAndAddFiles = (selectedFiles: FileList | File[]) => {
    setCertError(null);
    const newCerts: { id: string; file: File; name: string }[] = [];
    let hasError = false;

    Array.from(selectedFiles).forEach((selectedFile) => {
      const isPdf = selectedFile.type === "application/pdf";
      const isImage = selectedFile.type.startsWith("image/");
      
      if (!isPdf && !isImage) {
        hasError = true;
        return;
      }
      
      const defaultName = selectedFile.name.replace(/\.[^/.]+$/, "");
      newCerts.push({
        id: Math.random().toString(36).substring(7),
        file: selectedFile,
        name: defaultName,
      });
    });

    if (hasError) {
      setCertError("Algunos archivos fueron ignorados. Solo se permiten PDF o imágenes.");
    }

    if (newCerts.length > 0) {
      setCertificates((prev) => [...prev, ...newCerts]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      e.target.value = "";
    }
  };

  const updateCertificateName = (id: string, newName: string) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const removeCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };


  const handleNextStep = () => {
    if (!type || !originLocation || !justification) return;
    if (type === "transfer" && !destinationLocation) return;
    if (type === "transfer") {
       if (certificates.some(c => !c.name.trim())) {
           setCertError("Todos los certificados adjuntos deben tener un nombre.");
           return;
       }
    }
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
        if (certificates.length > 0) {
           payload.certificates = certificates.map(c => ({ file: c.file, name: c.name.trim() }));
        }
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
    setCertificates([]);
    setCertError(null);
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
        <DialogHeader className="p-6 border-b border-border bg-secondary/10 shrink-0">
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
                  if (val !== "transfer") setCertificates([]);
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

              {type === "transfer" && (
                <div className="flex flex-col gap-2 mt-2 pt-6 border-t border-border">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Certificados Adicionales (Opcional)
                  </Label>
                  <p className="text-xs text-muted-foreground">Si la transferencia incluye certificados de inspección o remisiones, puedes adjuntarlos aquí.</p>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      mt-2 relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all
                      ${isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border bg-secondary/10"}
                    `}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="size-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-foreground">
                        Arrastra archivos o haz clic
                      </p>
                    </div>
                  </div>

                  {certError && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1 animate-in slide-in-from-top-1">
                      <AlertCircle className="size-3 shrink-0" />
                      {certError}
                    </p>
                  )}

                  {certificates.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="flex flex-col gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                {cert.file.type === "application/pdf" ? (
                                  <FileText className="size-4 text-primary" />
                                ) : (
                                  <ImageIcon className="size-4 text-primary" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium text-foreground truncate">
                                  {cert.file.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase">
                                  {(cert.file.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 shrink-0 text-muted-foreground hover:text-red-500"
                              onClick={() => removeCertificate(cert.id)}
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                          <div>
                             <Input 
                               value={cert.name}
                               onChange={(e) => updateCertificateName(cert.id, e.target.value)}
                               className="h-8 text-xs bg-background/50 border-primary/20"
                               placeholder="Nombre del documento..."
                             />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

        <DialogFooter className="p-6 border-t border-border bg-secondary/10 shrink-0">
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
