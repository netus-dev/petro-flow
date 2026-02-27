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
import {
  Eye,
  Download,
  Search,
  Filter,
  MoreVertical,
  CheckSquare,
} from "lucide-react";
import { Input } from "@/src/core/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
import { TimesheetRequest } from "../../domain/entities";

interface Props {
  role: "Técnico" | "Supervisor" | "Gerente";
  requests: TimesheetRequest[];
  onViewDetail: (request: TimesheetRequest) => void;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  rigFilter: string;
  setRigFilter: (val: string) => void;
}

export function TimesheetTable({
  role,
  requests,
  onViewDetail,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  rigFilter,
  setRigFilter,
}: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprobada":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Rechazada":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Pendiente Supervisor":
      case "Pendiente Gerente":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const isAutorizador = role === "Supervisor" || role === "Gerente";

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Area */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-secondary/10 border border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por folio o nombre..."
              className="pl-10 h-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-10 text-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Pendiente Supervisor">
                Pendiente Supervisor
              </SelectItem>
              <SelectItem value="Pendiente Gerente">
                Pendiente Gerente
              </SelectItem>
              <SelectItem value="Aprobada">Aprobada</SelectItem>
              <SelectItem value="Rechazada">Rechazada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={rigFilter} onValueChange={setRigFilter}>
            <SelectTrigger className="w-40 h-10 text-sm">
              <SelectValue placeholder="RIG" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los RIGs</SelectItem>
              <SelectItem value="702">RIG 702</SelectItem>
              <SelectItem value="703">RIG 703</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {isAutorizador && (
            <Button
              variant="outline"
              className="h-10 gap-2 border-border border-dashed font-mono transition-colors hover:bg-secondary"
            >
              <CheckSquare className="size-4" />
              Aprobación Masiva
            </Button>
          )}
          <Button
            variant="outline"
            className="h-10 gap-2 border-border hover:bg-secondary"
          >
            <Download className="size-4" />
            Exportar Listado
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                Folio
              </TableHead>
              {isAutorizador && (
                <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                  Solicitante
                </TableHead>
              )}
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                RIG
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                Periodo
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-center">
                H. Extra
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-center">
                Festivos
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                Estado
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">
                Fecha Envío
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow
                key={req.id}
                className="hover:bg-secondary/20 transition-colors border-border"
              >
                <TableCell className="font-mono text-xs font-bold text-primary">
                  {req.folio}
                </TableCell>
                {isAutorizador && (
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground truncate w-40">
                        {req.workerName}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {req.role}
                      </span>
                    </div>
                  </TableCell>
                )}
                <TableCell className="font-mono text-xs">{req.rig}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {req.periodStart} – {req.periodEnd}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs font-bold font-mono text-foreground">
                    +{req.totalExtraHours}h
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {req.totalHolidayDays}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0 h-5 font-semibold ${getStatusColor(req.status)}`}
                  >
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[10px] text-muted-foreground">
                  {req.submittedAt?.split("T")[0] || "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-primary hover:bg-primary/10"
                      onClick={() => onViewDetail(req)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAutorizador ? 9 : 8}
                  className="h-32 text-center text-muted-foreground text-xs font-mono"
                >
                  No se encontraron solicitudes con el filtrado seleccionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          Mostrando {requests.length} entradas
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
