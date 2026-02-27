"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/core/presentation/components/ui/card";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { Button } from "@/src/core/presentation/components/ui/button";
import {
  ChevronLeft,
  Clock,
  Calendar as CalendarIcon,
  User,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
} from "lucide-react";
import {
  TimesheetRequest,
  DayCategory,
  ApprovalStatus,
} from "../../domain/entities";
import { Textarea } from "@/src/core/presentation/components/ui/textarea";

interface Props {
  role: "Técnico" | "Supervisor" | "Gerente";
  request: TimesheetRequest;
  onBack: () => void;
  onUpdateStatus: (
    id: string,
    status: ApprovalStatus,
    comment: string,
  ) => Promise<void>;
}

export function TimesheetDetailView({
  role,
  request,
  onBack,
  onUpdateStatus,
}: Props) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const getDayColor = (category: DayCategory) => {
    switch (category) {
      case "Jornada normal":
        return "bg-secondary text-muted-foreground";
      case "Tiempo extra":
        return "bg-primary/20 text-primary border-primary/30";
      case "Día festivo":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "Capacitación":
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      default:
        return "bg-secondary";
    }
  };

  const steps = [
    { label: "Enviado", status: request.submittedAt ? "completed" : "pending" },
    {
      label: "Supervisor",
      status:
        request.status === "Pendiente Gerente" || request.status === "Aprobada"
          ? "completed"
          : request.status === "Pendiente Supervisor"
            ? "current"
            : "pending",
    },
    {
      label: "Gerente",
      status:
        request.status === "Aprobada"
          ? "completed"
          : request.status === "Pendiente Gerente"
            ? "current"
            : "pending",
    },
    {
      label: "Aprobada",
      status: request.status === "Aprobada" ? "completed" : "pending",
    },
  ];

  const handleAction = async (isApproval: boolean) => {
    setIsSubmitting(true);
    try {
      let nextStatus: ApprovalStatus = isApproval ? "Aprobada" : "Rechazada";
      if (isApproval && role === "Supervisor") nextStatus = "Pendiente Gerente";

      await onUpdateStatus(request.id, nextStatus, comment);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canApprove =
    (role === "Supervisor" && request.status === "Pendiente Supervisor") ||
    (role === "Gerente" && request.status === "Pendiente Gerente");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="size-4" />
          Volver al listado
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 p-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 font-mono">
                {request.folio}
              </span>
              <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground truncate max-w-md">
                {request.workerName}
              </h1>
              <Badge
                variant="outline"
                className={`h-6 px-3 font-semibold ${getStatusColor(request.status)}`}
              >
                {request.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                {request.role} — RIG {request.rig}
              </span>
              <span className="flex items-center gap-2">
                <CalendarIcon className="size-4" />
                {request.periodStart} – {request.periodEnd}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 border-border h-10 font-mono uppercase text-[10px] tracking-wider"
            >
              <Download className="size-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-border h-10 font-mono uppercase text-[10px] tracking-wider"
            >
              <FileText className="size-4" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Approval Stepper */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between relative max-w-4xl mx-auto px-10">
            <div className="absolute left-[80px] right-[80px] top-1/2 -translate-y-1/2 h-0.5 bg-border z-0" />

            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 relative z-10 bg-card px-2"
              >
                <div
                  className={`size-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.status === "completed"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : step.status === "current"
                        ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20"
                        : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    step.status === "pending"
                      ? "text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Calendar View */}
        <Card className="lg:col-span-8 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold font-mono flex items-center gap-2">
              <CalendarIcon className="size-4 text-primary" />
              Detalle por día
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-7 gap-2">
              {request.days.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all hover:ring-2 hover:ring-primary/20 cursor-default ${getDayColor(day.category)}`}
                >
                  <span className="text-[10px] font-mono opacity-60">
                    {day.date.split("-")[2]}
                  </span>
                  {day.hoursExtra > 0 && (
                    <span className="text-xs font-bold font-mono">
                      +{day.hoursExtra}h
                    </span>
                  )}
                  <span className="text-[8px] uppercase tracking-tighter font-bold text-center leading-tight">
                    {day.category.split(" ")[0]}
                    {day.category.split(" ")[1] && <br />}
                    {day.category.split(" ")[1] || ""}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
              {[
                { label: "Extra", color: "bg-primary/20 border-primary/30" },
                {
                  label: "Festivo",
                  color: "bg-amber-500/20 border-amber-500/30",
                },
                {
                  label: "Capacitación",
                  color: "bg-emerald-500/20 border-emerald-500/30",
                },
                { label: "Normal", color: "bg-secondary border-border" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`size-3 rounded border ${l.color}`} />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    {l.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary Box */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-xl bg-secondary/20 border border-border">
              {[
                { label: "Días Trabajados", value: request.totalNormalDays },
                { label: "H. Normales", value: request.totalNormalDays * 8 },
                {
                  label: "H. Extra",
                  value: request.totalExtraHours,
                  highlight: true,
                },
                { label: "Días Festivos", value: request.totalHolidayDays },
                {
                  label: "H. Capacitación",
                  value: request.totalTrainingDays * 8,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center p-2"
                >
                  <span className="text-[10px] text-muted-foreground uppercase text-center">
                    {s.label}
                  </span>
                  <span
                    className={`text-xl font-bold font-mono ${s.highlight ? "text-primary" : "text-foreground"}`}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Comments and Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold font-mono flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                Comentarios y Notas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {request.comments.worker && (
                <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    Solicitante
                  </span>
                  <p className="text-xs text-foreground">
                    {request.comments.worker}
                  </p>
                </div>
              )}
              {request.comments.supervisor && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-primary">
                    Jefe Inmediato
                  </span>
                  <p className="text-xs text-foreground">
                    {request.comments.supervisor}
                  </p>
                </div>
              )}
              {request.comments.manager && (
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-emerald-500">
                    Gerencia Operativa
                  </span>
                  <p className="text-xs text-foreground">
                    {request.comments.manager}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {canApprove && (
            <Card className="border-primary/20 bg-primary/10 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">
                  Panel de Aprobación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Comentario de revisión
                  </span>
                  <Textarea
                    placeholder="Escribe un motivo para aprobar o rechazar..."
                    className="bg-card border-border text-xs resize-none h-24"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500 h-10 font-bold uppercase text-[10px]"
                    disabled={isSubmitting}
                    onClick={() => handleAction(false)}
                  >
                    <XCircle className="size-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-10 font-bold uppercase text-[10px]"
                    disabled={isSubmitting}
                    onClick={() => handleAction(true)}
                  >
                    <CheckCircle2 className="size-4 mr-2" />
                    Aprobar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
