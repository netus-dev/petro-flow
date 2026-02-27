"use client";

import { useState } from "react";
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/core/presentation/components/ui/card";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Button } from "@/src/core/presentation/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
import { useTimesheet } from "../hooks/use-timesheet";
import { OvertimeRecord, OvertimeStatus } from "../../domain/entities";

function StatusBadge({ status }: { status: OvertimeStatus }) {
  if (status === "approved")
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 text-emerald-500 text-[9px] tracking-wider uppercase"
      >
        Aprobado
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge
        variant="outline"
        className="border-primary/30 text-primary text-[9px] tracking-wider uppercase"
      >
        Pendiente
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="border-red-400/30 text-red-400 text-[9px] tracking-wider uppercase"
    >
      Rechazado
    </Badge>
  );
}

function RecordRow({
  record,
  expanded,
  onToggle,
}: {
  record: OvertimeRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border rounded-lg transition-all ${
        expanded ? "border-primary/20 bg-primary/5" : "border-border bg-card"
      }`}
    >
      {/* Main row */}
      <button
        onClick={onToggle}
        className="flex items-center gap-4 p-4 w-full text-left"
      >
        <div className="flex items-center justify-center size-9 rounded-lg bg-secondary/50 shrink-0">
          <User className="size-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs font-semibold text-foreground">
            {record.worker}
          </span>
          <span className="text-[10px] text-muted-foreground truncate">
            {record.workerRole} — {record.platform}
          </span>
        </div>
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span className="text-sm font-bold font-mono tabular-nums text-primary">
            +{record.hoursOvertime}h
          </span>
          <span className="text-[10px] text-muted-foreground">extras</span>
        </div>
        <div className="hidden md:flex flex-col items-end shrink-0">
          <span className="text-[11px] font-mono text-foreground">
            {record.date}
          </span>
        </div>
        <StatusBadge status={record.status} />
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/50 px-4 py-3 flex flex-col gap-3">
          {/* Reason */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
              Motivo
            </span>
            <p className="text-xs text-foreground leading-relaxed">
              {record.reason}
            </p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-0.5 rounded-md bg-secondary/30 p-2.5">
              <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                Horas Regulares
              </span>
              <span className="text-sm font-bold font-mono text-foreground">
                {record.hoursRegular}h
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-md bg-primary/5 border border-primary/10 p-2.5">
              <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                Horas Extra
              </span>
              <span className="text-sm font-bold font-mono text-primary">
                {record.hoursOvertime}h
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-md bg-secondary/30 p-2.5">
              <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                Total Jornada
              </span>
              <span className="text-sm font-bold font-mono text-foreground">
                {record.hoursRegular + record.hoursOvertime}h
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-md bg-secondary/30 p-2.5">
              <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                Plataforma
              </span>
              <span className="text-[11px] font-medium text-foreground">
                {record.platform}
              </span>
            </div>
          </div>

          {/* Authorization info */}
          <div className="flex items-center gap-4 rounded-md border border-border/50 bg-secondary/20 p-3">
            <Shield className="size-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                Autorizacion
              </span>
              {record.authorizedBy ? (
                <span className="text-xs text-foreground">
                  Autorizado por{" "}
                  <span className="font-semibold">{record.authorizedBy}</span>{" "}
                  el {record.authorizedDate}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Pendiente de autorizacion
                </span>
              )}
            </div>
            {record.completedDate && (
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                  Completado
                </span>
                <span className="text-[11px] font-mono text-emerald-500">
                  {record.completedDate}
                </span>
              </div>
            )}
          </div>

          {/* Actions for pending */}
          {record.status === "pending" && (
            <div className="flex items-center gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] border-red-400/30 text-red-400 hover:bg-red-400/10 hover:text-red-400"
              >
                <XCircle className="size-3 mr-1" />
                Rechazar
              </Button>
              <Button
                size="sm"
                className="h-7 text-[11px] bg-emerald-600 text-emerald-50 hover:bg-emerald-700"
              >
                <CheckCircle2 className="size-3 mr-1" />
                Aprobar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TimesheetContent() {
  const { records, stats, loading } = useTimesheet();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>("OT-001");

  const filtered = records.filter((r) => {
    const matchSearch =
      r.worker.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.platform.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 border border-primary/20">
            <Clock className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
              Timesheet
            </h1>
            <p className="text-sm text-muted-foreground">
              Registro y control de horas extras — Semana 9, 2026
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          {
            label: "Total H. Extra",
            value: `${stats.totalOvertime}h`,
            icon: Clock,
            color: "text-primary",
          },
          {
            label: "Aprobadas",
            value: stats.approved,
            icon: CheckCircle2,
            color: "text-emerald-500",
          },
          {
            label: "Pendientes",
            value: stats.pending,
            icon: AlertCircle,
            color: "text-primary",
          },
          {
            label: "Rechazadas",
            value: stats.rejected,
            icon: XCircle,
            color: "text-red-400",
          },
          {
            label: "Trabajadores",
            value: stats.totalWorkers,
            icon: User,
            color: "text-foreground",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center size-8 rounded-md bg-secondary/50">
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold font-mono tabular-nums text-foreground">
                  {stat.value}
                </span>
                <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar trabajador, ID o plataforma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-xs bg-secondary/50 border-border"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 text-xs w-full sm:w-48 bg-secondary/50 border-border">
            <Filter className="size-3 mr-1.5" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="approved">Aprobados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="rejected">Rechazados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
          Registros ({filtered.length})
        </span>
        {filtered.map((record) => (
          <RecordRow
            key={record.id}
            record={record}
            expanded={expandedId === record.id}
            onToggle={() =>
              setExpandedId(expandedId === record.id ? null : record.id)
            }
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No se encontraron registros
          </div>
        )}
      </div>
    </div>
  );
}
