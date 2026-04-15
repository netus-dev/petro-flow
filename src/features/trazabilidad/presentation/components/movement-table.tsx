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
import { Eye, Search, Filter } from "lucide-react";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Movement } from "../../domain/entities";
import { useState, useMemo } from "react";

interface Props {
  movements: Movement[];
  onViewDetail: (movement: Movement) => void;
}

export function MovementTable({ movements, onViewDetail }: Props) {
  const [search, setSearch] = useState("");

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const s = search.toLowerCase();
      return (
        m.originLocationName.toLowerCase().includes(s) ||
        m.originUbicationName.toLowerCase().includes(s) ||
        m.destinationLocationName.toLowerCase().includes(s) ||
        m.destinationUbicationName.toLowerCase().includes(s) ||
        m.justification.toLowerCase().includes(s) ||
        m.type.toLowerCase().includes(s)
      );
    });
  }, [movements, search]);

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case "transfer": return "Transferencia";
      case "reubication": return "Reubicación";
      case "replacement": return "Reemplazo";
      default: return type;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case "transfer": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "reubication": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "replacement": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Area */}
      <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[250px]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">Búsqueda libre</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por locación, ubicación, justificación..."
                className="pl-10 h-10 text-sm w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Fecha</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Origen</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Destino</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Tipo de Movimiento</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-center">Activos Involucrados</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Justificación</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-right">Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((movement) => (
              <TableRow
                key={movement.id}
                className="hover:bg-secondary/20 transition-colors border-border"
              >
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {movement.date ? new Date(movement.date).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {movement.originLocationName}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {movement.originUbicationName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {movement.destinationLocationName}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {movement.destinationUbicationName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 font-semibold ${getMovementTypeColor(movement.type)}`}>
                    {getMovementTypeLabel(movement.type)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-mono">
                    {movement.assetsInvolvedCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" title={movement.justification}>
                    {movement.justification || "Sin justificación"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-primary hover:bg-primary/10"
                    onClick={() => onViewDetail(movement)}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredMovements.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No se encontraron movimientos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Mockup */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground underline underline-offset-4 decoration-border">
          Mostrando {filteredMovements.length} movimientos
        </p>
      </div>
    </div>
  );
}
