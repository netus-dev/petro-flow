"use client";

import { useState, useEffect, useMemo } from "react";
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
  Calendar as CalendarIcon,
  Clock,
  Info,
  DollarSign,
  Save,
  Send,
  Plus,
} from "lucide-react";
import {
  TimesheetRequest,
  TimesheetDay,
  DayCategory,
  ApprovalStatus,
} from "../../domain/entities";
import { Input } from "@/src/core/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
import { Textarea } from "@/src/core/presentation/components/ui/textarea";

interface Props {
  role: "Técnico" | "Supervisor" | "Gerente";
  userId: string;
  workerName: string;
  onSave: (timesheet: TimesheetRequest) => Promise<void>;
  onCancel: () => void;
}

export function RegisterTimesheetForm({
  role,
  userId,
  workerName,
  onSave,
  onCancel,
}: Props) {
  const [rig, setRig] = useState("702");
  const [period, setPeriod] = useState("2026-02-01_2026-02-15");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize days for the selected period
  const [days, setDays] = useState<TimesheetDay[]>([]);

  useEffect(() => {
    const [start, end] = period.split("_");
    const newDays: TimesheetDay[] = [];
    let current = new Date(start);
    const finish = new Date(end);

    while (current <= finish) {
      newDays.push({
        date: current.toISOString().split("T")[0],
        category: "Jornada normal",
        hoursExtra: 0,
      });
      current.setDate(current.getDate() + 1);
    }
    setDays(newDays);
  }, [period]);

  const toggleDayCategory = (date: string) => {
    const categories: DayCategory[] = [
      "Jornada normal",
      "Tiempo extra",
      "Día festivo",
      "Capacitación",
    ];
    setDays((prev) =>
      prev.map((d) => {
        if (d.date === date) {
          const currentIdx = categories.indexOf(d.category);
          const nextIdx = (currentIdx + 1) % categories.length;
          const nextCategory = categories[nextIdx];
          return {
            ...d,
            category: nextCategory,
            hoursExtra: nextCategory === "Tiempo extra" ? 4 : 0,
          };
        }
        return d;
      }),
    );
  };

  const updateExtraHours = (date: string, hours: number) => {
    setDays((prev) =>
      prev.map((d) => (d.date === date ? { ...d, hoursExtra: hours } : d)),
    );
  };

  const totals = useMemo(() => {
    return {
      extra: days.reduce((acc, d) => acc + d.hoursExtra, 0),
      normal: days.filter((d) => d.category === "Jornada normal").length,
      holiday: days.filter((d) => d.category === "Día festivo").length,
      training: days.filter((d) => d.category === "Capacitación").length,
      total: days.length,
    };
  }, [days]);

  const estimatedPayment = totals.extra * 45.5; // Mock rate

  const handleFinish = async (status: ApprovalStatus) => {
    setIsSubmitting(true);
    try {
      const [start, end] = period.split("_");
      const request: TimesheetRequest = {
        id: `TS-${Date.now()}`,
        folio: `FMS-TS-${Math.floor(Math.random() * 100000)}`,
        workerId: userId,
        workerName: workerName,
        role: role,
        rig: rig,
        periodStart: start,
        periodEnd: end,
        days: days,
        totalExtraHours: totals.extra,
        totalNormalDays: totals.normal,
        totalHolidayDays: totals.holiday,
        totalTrainingDays: totals.training,
        status: status,
        submittedAt:
          status === "Pendiente Supervisor" ? new Date().toISOString() : null,
        comments: {
          worker: comment,
        },
      };
      await onSave(request);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="size-3" />
            Cancelar y volver
          </button>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
            Nueva Solicitud TimeSheet
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Periodo de Quincena
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 border-border gap-2 font-bold uppercase text-[10px]"
            onClick={() => handleFinish("Borrador")}
          >
            <Save className="size-4" />
            Guardar Borrador
          </Button>
          <Button
            className="h-10 bg-primary hover:bg-primary/90 text-white gap-2 font-bold uppercase text-[10px]"
            onClick={() => handleFinish("Pendiente Supervisor")}
          >
            <Send className="size-4" />
            Enviar Solicitud
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Section */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Seleccionar RIG
              </span>
              <Select value={rig} onValueChange={setRig}>
                <SelectTrigger className="bg-card border-border h-12 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="702">RIG 702 (Santa Maria)</SelectItem>
                  <SelectItem value="703">RIG 703 (Covadonga)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Seleccionar Quincena
              </span>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="bg-card border-border h-12 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026-02-01_2026-02-15">
                    FEBRERO 1RA (01 - 15)
                  </SelectItem>
                  <SelectItem value="2026-02-16_2026-02-28">
                    FEBRERO 2DA (16 - 28)
                  </SelectItem>
                  <SelectItem value="2026-03-01_2026-03-15">
                    MARZO 1RA (01 - 15)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Calendario de Actividades
              </span>
              <div className="flex gap-4">
                {["Normal", "Extra", "Festivo", "Capacitación"].map((l) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div
                      className={`size-2 rounded-full ${
                        l === "Normal"
                          ? "bg-muted"
                          : l === "Extra"
                            ? "bg-primary"
                            : l === "Festivo"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                      }`}
                    />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60">
                      {l}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {days.map((day, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleDayCategory(day.date)}
                    className={`h-24 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all group relative overflow-hidden ${
                      day.category === "Tiempo extra"
                        ? "border-primary bg-primary/10"
                        : day.category === "Día festivo"
                          ? "border-amber-500 bg-amber-500/10"
                          : day.category === "Capacitación"
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-border bg-card hover:bg-secondary/50"
                    }`}
                  >
                    <span className="text-[10px] font-mono opacity-50 absolute top-2 right-2">
                      {day.date.split("-")[2]}
                    </span>
                    <Plus className="size-4 text-muted-foreground/30 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span
                      className={`text-[8px] uppercase font-bold text-center leading-tight transition-colors ${
                        day.category === "Jornada normal"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {day.category}
                    </span>
                    {day.hoursExtra > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono bg-card border-border"
                      >
                        {day.hoursExtra}h
                      </Badge>
                    )}
                  </button>
                  {(day.category === "Tiempo extra" && (
                    <Input
                      type="number"
                      className="h-8 text-center text-xs px-1 font-mono border-primary/50 focus:border-primary"
                      value={day.hoursExtra}
                      onChange={(e) =>
                        updateExtraHours(day.date, Number(e.target.value))
                      }
                    />
                  )) || <div className="h-8" />}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Comentarios Adicionales
            </span>
            <Textarea
              placeholder="Detalla los motivos del tiempo extra o notas adicionales..."
              className="bg-card border-border text-sm min-h-[120px] resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        {/* Sticky Summary Panel */}
        <div className="lg:col-span-4 sticky top-6">
          <Card className="border-border bg-card border-l-4 border-l-primary shadow-xl">
            <CardHeader className="border-b border-border bg-secondary/10">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Info className="size-4 text-primary" />
                Resumen de Solicitud
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 flex flex-col gap-4">
                <div className="space-y-4">
                  {[
                    {
                      label: "Total Días Periodo",
                      value: totals.total,
                      icon: CalendarIcon,
                    },
                    {
                      label: "Jornada Normal",
                      value: `${totals.normal} días`,
                      icon: Info,
                    },
                    {
                      label: "Tiempo Extra",
                      value: `${totals.extra} h`,
                      icon: Clock,
                      highlight: true,
                    },
                    {
                      label: "Días Festivos",
                      value: totals.holiday,
                      icon: Info,
                    },
                    {
                      label: "Días Capacitación",
                      value: totals.training,
                      icon: Info,
                    },
                  ].map((sum) => (
                    <div
                      key={sum.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <sum.icon className="size-3.5" />
                        <span className="text-xs uppercase font-semibold tracking-tighter">
                          {sum.label}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-sm font-bold ${sum.highlight ? "text-primary" : "text-foreground"}`}
                      >
                        {sum.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1 items-center">
                  <span className="text-[9px] uppercase font-bold text-emerald-500 tracking-widest">
                    Pago Extra Estimado
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <DollarSign className="size-5" />
                    <span className="text-3xl font-bold font-mono tabular-nums leading-none">
                      {estimatedPayment.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-muted-foreground leading-relaxed p-3 bg-secondary/30 rounded-lg">
                  <strong className="text-foreground uppercase block mb-1">
                    Nota Legal:
                  </strong>
                  Al enviar esta solicitud, Ud. declara que los tiempos
                  registrados coinciden con las bitácoras operativas del RIG{" "}
                  {rig}.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
