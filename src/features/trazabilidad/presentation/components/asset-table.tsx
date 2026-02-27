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
import { Eye, Download, MoreVertical, Search, Filter } from "lucide-react";
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

interface Props {
  assets: Asset[];
  onViewDetail: (asset: Asset) => void;
  search: string;
  setSearch: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export function AssetTable({
  assets,
  onViewDetail,
  search,
  setSearch,
  locationFilter,
  setLocationFilter,
  statusFilter,
  setStatusFilter,
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

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Area */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-secondary/20 border border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código o serie..."
              className="pl-10 h-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40 h-10 text-sm">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              <SelectItem value="RIG 702">RIG 702</SelectItem>
              <SelectItem value="RIG 703">RIG 703</SelectItem>
              <SelectItem value="Base Proveedor">Base Proveedor</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10 text-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Operativo">Operativo</SelectItem>
              <SelectItem value="En mantenimiento">En mantenimiento</SelectItem>
              <SelectItem value="En tránsito">En tránsito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="h-10 gap-2 border-border hover:bg-secondary"
        >
          <Download className="size-4" />
          Exportar Censo
        </Button>
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
                className="hover:bg-secondary/20 transition-colors border-border"
              >
                <TableCell className="font-medium text-foreground">
                  {asset.code}
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
