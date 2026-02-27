"use client";

import { useState } from "react";
import {
  Gauge,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/core/presentation/components/ui/card";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import { Progress } from "@/src/core/presentation/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/core/presentation/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/core/presentation/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Platform odometer data
type OdometerRecord = {
  id: string;
  platform: string;
  equipment: string;
  currentReading: number;
  previousReading: number;
  unit: string;
  lastUpdated: string;
  maxThreshold: number;
  status: "normal" | "warning" | "critical";
};

const initialRecords: OdometerRecord[] = [
  {
    id: "ODO-001",
    platform: "Plataforma Norte",
    equipment: "Motor Principal MP-01",
    currentReading: 4280,
    previousReading: 4100,
    unit: "hrs",
    lastUpdated: "2026-02-27",
    maxThreshold: 5000,
    status: "warning",
  },
  {
    id: "ODO-002",
    platform: "Plataforma Norte",
    equipment: "Compresor CG-04",
    currentReading: 2150,
    previousReading: 2000,
    unit: "hrs",
    lastUpdated: "2026-02-27",
    maxThreshold: 6000,
    status: "normal",
  },
  {
    id: "ODO-003",
    platform: "Plataforma Sur",
    equipment: "Bomba de Inyeccion BI-12",
    currentReading: 5800,
    previousReading: 5600,
    unit: "hrs",
    lastUpdated: "2026-02-26",
    maxThreshold: 6000,
    status: "critical",
  },
  {
    id: "ODO-004",
    platform: "Plataforma Sur",
    equipment: "Generador GE-07",
    currentReading: 3400,
    previousReading: 3200,
    unit: "hrs",
    lastUpdated: "2026-02-27",
    maxThreshold: 8000,
    status: "normal",
  },
  {
    id: "ODO-005",
    platform: "Plataforma Este",
    equipment: "Motor Auxiliar MA-03",
    currentReading: 1900,
    previousReading: 1800,
    unit: "hrs",
    lastUpdated: "2026-02-27",
    maxThreshold: 5000,
    status: "normal",
  },
  {
    id: "ODO-006",
    platform: "Plataforma Este",
    equipment: "Turbina de Gas TG-01",
    currentReading: 7200,
    previousReading: 7000,
    unit: "hrs",
    lastUpdated: "2026-02-25",
    maxThreshold: 8000,
    status: "warning",
  },
];

const chartData = [
  { name: "Ene", norte: 320, sur: 280, este: 240 },
  { name: "Feb", norte: 350, sur: 310, este: 260 },
  { name: "Mar", norte: 300, sur: 290, este: 230 },
  { name: "Abr", norte: 380, sur: 340, este: 280 },
  { name: "May", norte: 360, sur: 320, este: 250 },
  { name: "Jun", norte: 400, sur: 350, este: 290 },
];

const trendData = [
  { day: "Lun", reading: 4200 },
  { day: "Mar", reading: 4220 },
  { day: "Mie", reading: 4240 },
  { day: "Jue", reading: 4255 },
  { day: "Vie", reading: 4270 },
  { day: "Sab", reading: 4275 },
  { day: "Dom", reading: 4280 },
];

function getStatusBorderColor(status: string) {
  if (status === "normal") return "border-emerald-500/20";
  if (status === "warning") return "border-primary/20";
  return "border-red-400/20";
}

import { useOrometers } from "../hooks/use-orometers";

export function OrometersContent() {
  const { records, stats, loading, addRecord } = useOrometers();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    platform: "",
    equipment: "",
    reading: "",
    maxThreshold: "",
  });

  const filtered =
    selectedPlatform === "all"
      ? records
      : records.filter((r) => r.platform === selectedPlatform);

  const handleAddRecord = () => {
    if (
      !newRecord.platform ||
      !newRecord.equipment ||
      !newRecord.reading ||
      !newRecord.maxThreshold
    )
      return;
    addRecord(newRecord);
    setNewRecord({
      platform: "",
      equipment: "",
      reading: "",
      maxThreshold: "",
    });
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground font-mono text-xs">
        Cargando odometros...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 border border-primary/20">
            <Gauge className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
              Orometers Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              KPIs de odometros por plataforma y registro de lecturas
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3 mr-1.5" />
              Nueva Lectura
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground font-mono">
                Registrar Nueva Lectura
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Agrega una nueva lectura de odometro para alimentar los KPIs.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Plataforma
                </Label>
                <Select
                  value={newRecord.platform}
                  onValueChange={(v) =>
                    setNewRecord({ ...newRecord, platform: v })
                  }
                >
                  <SelectTrigger className="h-9 text-xs bg-secondary/50 border-border w-full">
                    <SelectValue placeholder="Seleccionar plataforma" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Plataforma Norte">
                      Plataforma Norte
                    </SelectItem>
                    <SelectItem value="Plataforma Sur">
                      Plataforma Sur
                    </SelectItem>
                    <SelectItem value="Plataforma Este">
                      Plataforma Este
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Equipo</Label>
                <Input
                  value={newRecord.equipment}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, equipment: e.target.value })
                  }
                  placeholder="Ej: Motor Principal MP-05"
                  className="h-9 text-xs bg-secondary/50 border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Lectura Actual (hrs)
                  </Label>
                  <Input
                    type="number"
                    value={newRecord.reading}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, reading: e.target.value })
                    }
                    placeholder="0"
                    className="h-9 text-xs bg-secondary/50 border-border"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Umbral Maximo (hrs)
                  </Label>
                  <Input
                    type="number"
                    value={newRecord.maxThreshold}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        maxThreshold: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="h-9 text-xs bg-secondary/50 border-border"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="text-xs bg-primary text-primary-foreground"
                onClick={handleAddRecord}
              >
                Registrar Lectura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          {
            label: "Total Odometros",
            value: stats.total,
            icon: Gauge,
            color: "text-foreground",
          },
          {
            label: "Normal",
            value: stats.normal,
            icon: CheckCircle2,
            color: "text-emerald-500",
          },
          {
            label: "Advertencia",
            value: stats.warning,
            icon: AlertTriangle,
            color: "text-primary",
          },
          {
            label: "Critico",
            value: stats.critical,
            icon: AlertTriangle,
            color: "text-red-400",
          },
          {
            label: "Uso Promedio",
            value: `${stats.avgUsage}%`,
            icon: Activity,
            color: "text-primary",
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bar Chart — Hours by Platform */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-mono text-foreground">
              Horas Acumuladas por Plataforma
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Ultimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.25 0.01 250)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "oklch(0.60 0.02 250)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "oklch(0.60 0.02 250)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.005 250)",
                      border: "1px solid oklch(0.25 0.01 250)",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "oklch(0.95 0.01 90)",
                    }}
                  />
                  <Bar
                    dataKey="norte"
                    fill="oklch(0.75 0.16 65)"
                    radius={[3, 3, 0, 0]}
                    name="Norte"
                  />
                  <Bar
                    dataKey="sur"
                    fill="oklch(0.60 0.12 45)"
                    radius={[3, 3, 0, 0]}
                    name="Sur"
                  />
                  <Bar
                    dataKey="este"
                    fill="oklch(0.50 0.08 250)"
                    radius={[3, 3, 0, 0]}
                    name="Este"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Line Chart — Trend */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold font-mono text-foreground">
              Tendencia Semanal — MP-01
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Motor Principal, Plataforma Norte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.25 0.01 250)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "oklch(0.60 0.02 250)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "oklch(0.60 0.02 250)" }}
                    axisLine={false}
                    tickLine={false}
                    domain={["dataMin - 50", "dataMax + 50"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.005 250)",
                      border: "1px solid oklch(0.25 0.01 250)",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "oklch(0.95 0.01 90)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reading"
                    stroke="oklch(0.75 0.16 65)"
                    strokeWidth={2}
                    dot={{ fill: "oklch(0.75 0.16 65)", r: 3 }}
                    name="Lectura"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Records */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
            Registros de Odometros
          </span>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="h-8 text-xs w-48 bg-secondary/50 border-border">
              <SelectValue placeholder="Filtrar plataforma" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todas las plataformas</SelectItem>
              <SelectItem value="Plataforma Norte">Plataforma Norte</SelectItem>
              <SelectItem value="Plataforma Sur">Plataforma Sur</SelectItem>
              <SelectItem value="Plataforma Este">Plataforma Este</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((record) => {
            const usage = Math.round(
              (record.currentReading / record.maxThreshold) * 100,
            );
            const delta = record.currentReading - record.previousReading;
            return (
              <Card
                key={record.id}
                className={`border bg-card transition-colors ${getStatusBorderColor(record.status)}`}
              >
                <CardContent className="flex flex-col gap-3 p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground">
                        {record.equipment}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {record.platform}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[9px] tracking-wider uppercase ${
                        record.status === "normal"
                          ? "border-emerald-500/30 text-emerald-500"
                          : record.status === "warning"
                            ? "border-primary/30 text-primary"
                            : "border-red-400/30 text-red-400"
                      }`}
                    >
                      {record.status === "normal"
                        ? "Normal"
                        : record.status === "warning"
                          ? "Advertencia"
                          : "Critico"}
                    </Badge>
                  </div>

                  {/* Reading */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                      {record.currentReading.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {record.unit}
                    </span>
                    <div
                      className={`flex items-center gap-0.5 ml-auto text-[11px] font-medium ${
                        delta > 0 ? "text-primary" : "text-emerald-500"
                      }`}
                    >
                      {delta > 0 ? (
                        <TrendingUp className="size-3" />
                      ) : (
                        <TrendingDown className="size-3" />
                      )}
                      +{delta} {record.unit}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        Uso del ciclo
                      </span>
                      <span className="text-[10px] font-bold font-mono text-foreground">
                        {usage}%
                      </span>
                    </div>
                    <Progress value={usage} className="h-1.5" />
                    <span className="text-[9px] text-muted-foreground">
                      Maximo: {record.maxThreshold.toLocaleString()}{" "}
                      {record.unit}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {record.id}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Actualizado: {record.lastUpdated}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
