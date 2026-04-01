"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/core/presentation/components/ui/tabs";
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
  Info,
  History,
  Map as MapIcon,
  Calendar,
  User,
  MessageSquare,
  MapPin,
  FileText,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Asset } from "../../domain/entities";
import { EquipmentJourneyMap } from "./equipment-journey-map";
import { RegisterMovementModal } from "./register-movement-modal";
import { AddCertificateModal } from "./add-certificate-modal";
import { RegisterAssetModal } from "./register-asset-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/core/presentation/components/ui/alert-dialog";


interface Props {
  asset: Asset;
  onBack: () => void;
  onRegisterMovement: (assetId: string, movement: any) => Promise<void>;
  onAddCertificate: (assetId: string, certificate: any) => Promise<void>;
  onEditAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  onDisableAsset: (id: string) => Promise<void>;
}

export function AssetDetail({
  asset,
  onBack,
  onRegisterMovement,
  onAddCertificate,
  onEditAsset,
  onDisableAsset,
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
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="size-4" />
        Volver al listado
      </button>

      {/* Read Only Banner */}
      {asset.is_active === false && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg font-mono text-sm">
          <AlertCircle className="size-5" />
          <p>
            <strong>Este activo está deshabilitado</strong> y se encuentra en modo de solo lectura. No es posible editar su información ni registrar nuevos movimientos.
          </p>
        </div>
      )}

      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {asset.code}
            </h1>
            <Badge
              variant="outline"
              className={`h-6 px-3 font-semibold ${getStatusColor(asset.status)}`}
            >
              {asset.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Info className="size-4" />
              {asset.functionalPrinciple}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" />
              {asset.currentLocation} — {asset.position}
            </span>
          </div>
        </div>

        {asset.is_active !== false && (
          <RegisterMovementModal
            asset={asset}
            onRegister={onRegisterMovement}
          />
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-transparent h-12 w-full justify-start gap-8 border-b border-border p-0 mb-8 rounded-none">
          <TabsTrigger
            value="general"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all shadow-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent focus-visible:ring-0 gap-2"
          >
            <Info className="size-4" />
            Información General
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all shadow-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent focus-visible:ring-0 gap-2"
          >
            <History className="size-4" />
            Historial de Movimientos
          </TabsTrigger>
          <TabsTrigger
            value="map"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all shadow-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent focus-visible:ring-0 gap-2"
          >
            <MapIcon className="size-4" />
            Ubicación en Mapa
          </TabsTrigger>
          <TabsTrigger
            value="certificates"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all shadow-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent focus-visible:ring-0 gap-2"
          >
            <FileText className="size-4" />
            Certificados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <CardTitle className="text-lg font-mono">
                Detalles Técnicos
              </CardTitle>
              {asset.is_active !== false && (
                <RegisterAssetModal
                  mode="edit"
                  assetToEdit={asset}
                  onEdit={onEditAsset}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2 bg-secondary/50 border-border hover:bg-secondary text-xs"
                    >
                      <Edit2 className="size-3.5" />
                      Editar Detalles
                    </Button>
                  }
                />
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { label: "Marca", value: asset.brand },
                { label: "Modelo", value: asset.model },
                { label: "Capacidad", value: asset.capacity },
                { label: "Número de Serie", value: asset.serialNumber },
                {
                  label: "Principio Funcional",
                  value: asset.functionalPrinciple,
                },
                { label: "Fecha Alta", value: asset.createdAt || "N/A" },
                { label: "Último Movimiento", value: asset.lastMovementDate },
                { label: "Cód. Última Inspección", value: asset.lastInspectionCode },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}

              {asset.properties && asset.properties.length > 0 && (
                <>
                  <div className="col-span-full mt-4 flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Propiedades: {asset.functionalPrinciple}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {asset.properties.map((prop, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-lg bg-secondary/20 border border-border/50">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                          {prop.label}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {prop.value} {prop.default_unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Disable Asset Button */}
              {asset.is_active !== false && (
                <div className="col-span-full flex justify-end mt-4 pt-6 border-t border-border">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="size-4" />
                        Deshabilitar Activo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-mono">¿Estás seguro de deshabilitar este activo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción convertirá el activo a modo "Solo lectura". 
                          Ya no será posible editarlo, transferirlo ni subir nuevos certificados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border hover:bg-secondary">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          onClick={() => onDisableAsset(asset.id)}
                        >
                          Sí, Deshabilitar Activo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-mono">
                Línea de Tiempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                {asset.journey.map((stop, idx) => (
                  <div key={stop.id} className="relative mb-8 last:mb-0">
                    <div
                      className={`absolute -left-8 top-1 size-6 rounded-full border-4 border-card bg-secondary flex items-center justify-center ${idx === 0 ? "bg-primary" : ""}`}
                    >
                      <div className="size-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground font-mono">
                          {stop.originLocation ? `${stop.originLocation} ➔ ${stop.location}` : stop.location}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase tracking-widest bg-secondary"
                        >
                          {stop.service}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          {stop.dateIn}{" "}
                          {stop.dateOut ? `— ${stop.dateOut}` : ""}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="size-3.5" />
                          {stop.responsible || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MessageSquare className="size-3.5" />
                          {stop.notes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b border-border">
              <CardTitle className="text-lg font-mono flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                Visualización de Trayectoria
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <EquipmentJourneyMap journey={asset.journey} />

              {/* Mock Map Layout */}
              <div className="mt-12 grid grid-cols-3 gap-4 h-32 relative">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-border border-dashed border-t" />
                {[
                  {
                    name: "RIG 702",
                    active: asset.currentLocation === "RIG 702",
                  },
                  {
                    name: "Base Proveedor",
                    active: asset.currentLocation === "Base Proveedor",
                  },
                  {
                    name: "RIG 703",
                    active: asset.currentLocation === "RIG 703",
                  },
                ].map((loc) => (
                  <div
                    key={loc.name}
                    className={`relative z-10 flex flex-col items-center justify-center rounded-lg border bg-card transition-all ${
                      loc.active
                        ? "border-primary ring-4 ring-primary/10 scale-105"
                        : "border-border opacity-60"
                    }`}
                  >
                    <MapPin
                      className={`size-6 mb-1 ${loc.active ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-tighter ${loc.active ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {loc.name}
                    </span>
                    {loc.active && (
                      <div className="absolute -top-2 px-2 py-0.5 rounded bg-primary text-[8px] font-bold text-white uppercase animate-bounce">
                        Actual
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="certificates">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-secondary/10 py-4">
              <CardTitle className="text-lg font-mono">
                Historial de Certificados
              </CardTitle>
              <AddCertificateModal asset={asset} onAdd={onAddCertificate} />
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        ID
                      </th>
                      <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Nombre
                      </th>
                      <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Fecha Carga
                      </th>
                      <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-right">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {asset.certificates &&
                      asset.certificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="hover:bg-secondary/10 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-xs text-foreground">
                            {cert.id}
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-foreground">
                            {cert.name}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {cert.uploadDate}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-bold uppercase border-border hover:bg-primary/10 hover:text-primary transition-colors"
                              onClick={() =>
                                window.open(cert.fileUrl, "_blank")
                              }
                            >
                              <FileText className="size-3 mr-1" />
                              Ver PDF
                            </Button>
                          </td>
                        </tr>
                      ))}
                    {(!asset.certificates ||
                      asset.certificates.length === 0) && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-sm text-muted-foreground"
                        >
                          No hay certificados registrados para este activo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
