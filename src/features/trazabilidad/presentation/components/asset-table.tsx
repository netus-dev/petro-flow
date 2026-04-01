"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/core/presentation/components/ui/table";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Eye, Download, MoreVertical, Search, Filter, Edit2 } from "lucide-react";
import { Input } from "@/src/core/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/core/presentation/components/ui/dropdown-menu";
import { Asset } from "../../domain/entities";
import { FileText } from "lucide-react";
import { RegisterAssetModal } from "./register-asset-modal";

interface Props {
  assets: Asset[];
  allAssets: Asset[];
  onViewDetail: (asset: Asset) => void;
  search: string;
  setSearch: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  ubicationFilter: string;
  setUbicationFilter: (val: string) => void;
  disabledFilter: boolean;
  setDisabledFilter: (val: boolean) => void;
  onEditAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
}

export function AssetTable({
  assets,
  allAssets,
  onViewDetail,
  search,
  setSearch,
  locationFilter,
  setLocationFilter,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  ubicationFilter,
  setUbicationFilter,
  disabledFilter,
  setDisabledFilter,
  onEditAsset,
}: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Operativo":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "En mantenimiento":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "En tránsito":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const filteredForLocation = locationFilter === "all" 
      ? allAssets 
      : allAssets.filter(a => a.currentLocation === locationFilter || a.current_location_id === locationFilter);

  const uniqueLocations = Array.from(new Set(allAssets.map(a => a.currentLocation).filter(Boolean)));
  const availablePrinciples = Array.from(new Set(filteredForLocation.map(a => a.functionalPrinciple).filter(Boolean)));
  const availableUbications = Array.from(new Set(filteredForLocation.map(a => a.position).filter(Boolean).filter(p => p !== "N/A")));

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Area */}
      <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="flex flex-col gap-1.5 w-40">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">Locación</span>
            <Select value={locationFilter} onValueChange={(val) => {
              setLocationFilter(val);
              setTypeFilter("all");
              setUbicationFilter("all");
            }}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Locación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {uniqueLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-40">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">Principio Func.</span>
            <Select value={typeFilter} onValueChange={setTypeFilter} disabled={!availablePrinciples.length}>
              <SelectTrigger className="h-10 text-sm truncate">
                <SelectValue placeholder="Principio Func." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availablePrinciples.map(fp => (
                  <SelectItem key={fp} value={fp}>{fp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-40">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">Ubicación</span>
            <Select value={ubicationFilter} onValueChange={setUbicationFilter} disabled={!availableUbications.length}>
              <SelectTrigger className="h-10 text-sm truncate">
                <SelectValue placeholder="Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableUbications.map(ubi => (
                  <SelectItem key={ubi} value={ubi}>{ubi}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-40">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">Estado</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Operativo">Operativo</SelectItem>
                <SelectItem value="En mantenimiento">En mantenimiento</SelectItem>
                <SelectItem value="En tránsito">En tránsito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[250px]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">Búsqueda libre</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por serie, cdo. inspección, modelo..."
                className="pl-10 h-10 text-sm w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground select-none">
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${disabledFilter ? 'bg-destructive' : 'bg-border'}`}>
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={disabledFilter} 
                onChange={(e) => setDisabledFilter(e.target.checked)} 
              />
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${disabledFilter ? 'translate-x-4' : 'translate-x-1'}`} />
            </div>
            Incluir activos deshabilitados
          </label>

          <Button
            variant="outline"
            className="h-10 gap-2 border-border hover:bg-secondary"
          >
            <Download className="size-4" />
            Exportar Censo
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                Código
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                Principio Funcional
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                Marca/Modelo
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                No. Serie
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                Ubicación Actual
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                Estado
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow
                key={asset.id}
                className={`hover:bg-secondary/20 transition-colors border-border ${asset.is_active === false ? 'opacity-50 grayscale' : ''}`}
              >
                <TableCell className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    {asset.code}
                    {asset.is_active === false && (
                      <Badge variant="destructive" className="h-5 text-[9px] uppercase px-1.5 whitespace-nowrap">
                        Deshabilitado
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {asset.functionalPrinciple}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {asset.brand}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {asset.model}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {asset.serialNumber}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-foreground font-medium">
                      {asset.currentLocation}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {asset.position}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0 h-5 font-semibold ${getStatusColor(asset.status)}`}
                  >
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-primary hover:bg-primary/10"
                      onClick={() => onViewDetail(asset)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-card border-border"
                      >
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                          Acciones
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border" />
                        
                        {asset.is_active !== false && (
                          <RegisterAssetModal
                            mode="edit"
                            assetToEdit={asset}
                            onEdit={onEditAsset}
                            trigger={
                              <DropdownMenuItem
                                className="gap-2 text-xs focus:bg-secondary cursor-pointer"
                                onSelect={(e) => {
                                  // Prevent dropdown from closing immediately when opening dialog
                                  e.preventDefault();
                                }}
                              >
                                <Edit2 className="size-3.5" /> Editar
                              </DropdownMenuItem>
                            }
                          />
                        )}

                        <DropdownMenuItem
                          className="gap-2 text-xs focus:bg-secondary cursor-pointer"
                          onClick={() => onViewDetail(asset)}
                        >
                          <Eye className="size-3.5" /> Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs focus:bg-secondary cursor-pointer"
                          onClick={() => {
                            if (
                              asset.certificates &&
                              asset.certificates.length > 0
                            ) {
                              window.open(
                                asset.certificates[0].fileUrl,
                                "_blank",
                              );
                            } else {
                              alert(
                                "No hay certificados disponibles para este activo.",
                              );
                            }
                          }}
                        >
                          <FileText className="size-3.5" /> Ver Certificado
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs focus:bg-secondary cursor-pointer">
                          <Download className="size-3.5" /> Descargar QR
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {assets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No se encontraron activos con el filtrado seleccionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Mockup */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground underline underline-offset-4 decoration-border">
          Mostrando {assets.length} activos
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="h-8 text-xs">
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled className="h-8 text-xs">
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
