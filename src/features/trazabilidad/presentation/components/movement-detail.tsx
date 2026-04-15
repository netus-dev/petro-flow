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
  Calendar,
  User,
  MessageSquare,
  MapPin,
  FileText,
  Boxes,
  Upload,
} from "lucide-react";
import { Movement } from "../../domain/entities";

interface Props {
  movement: Movement;
  onBack: () => void;
  // onAddCertificate: (movementId: string, certificate: any) => Promise<void>; 
}

export function MovementDetail({
  movement,
  onBack,
}: Props) {
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
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="size-4" />
        Volver al listado
      </button>

      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-foreground">
              Movimiento: {movement.id.split("-")[0].toUpperCase()}
            </h1>
            <Badge
              variant="outline"
              className={`h-6 px-3 font-semibold ${getMovementTypeColor(movement.type)}`}
            >
              {getMovementTypeLabel(movement.type)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                 <Calendar className="size-3" /> Fecha
               </span>
               <span className="text-sm font-medium text-foreground">
                 {movement.date ? new Date(movement.date).toLocaleString() : "N/A"}
               </span>
            </div>
            
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                 <User className="size-3" /> Creado Por
               </span>
               <span className="text-sm font-medium text-foreground">
                 {movement.createdBy}
               </span>
            </div>
            
            <div className="flex flex-col gap-1 col-span-1 md:col-span-2 lg:col-span-2">
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                 <MessageSquare className="size-3" /> Justificación
               </span>
               <span className="text-sm font-medium text-foreground">
                 {movement.justification || "Sin justificación"}
               </span>
            </div>
          </div>
          
          <div className="h-px w-full bg-border my-2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/10 border border-border/50">
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Origen</span>
               <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                   <MapPin className="size-3 text-muted-foreground" /> {movement.originLocationName}
               </span>
               <span className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-80">
                   <div className="pl-4">↳ {movement.originUbicationName}</div>
               </span>
             </div>
             <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/10 border border-border/50">
               <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Destino</span>
               <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                   <MapPin className="size-3 text-muted-foreground" /> {movement.destinationLocationName}
               </span>
               <span className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-80">
                   <div className="pl-4">↳ {movement.destinationUbicationName}</div>
               </span>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="bg-transparent h-12 w-full justify-start gap-8 border-b border-border p-0 mb-8 rounded-none">
          <TabsTrigger
            value="assets"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all shadow-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent focus-visible:ring-0 gap-2"
          >
            <Boxes className="size-4" />
            Activos Involucrados ({movement.assetsInvolvedCount})
          </TabsTrigger>
          <TabsTrigger
            value="certificates"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all shadow-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent focus-visible:ring-0 gap-2"
          >
            <FileText className="size-4" />
            Certificados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-mono">
                Activos Transferidos/Reubicados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Código / SN
                      </th>
                      <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Nombre
                      </th>
                      <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Comentarios
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {movement.assetsInvolved &&
                      movement.assetsInvolved.map((asset) => (
                        <tr
                          key={asset.asset_id}
                          className="hover:bg-secondary/10 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-xs text-foreground font-medium">
                            {asset.asset_code}
                          </td>
                          <td className="px-6 py-4 text-xs text-foreground">
                            {asset.asset_name}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {asset.comments || "-"}
                          </td>
                        </tr>
                      ))}
                    {(!movement.assetsInvolved ||
                      movement.assetsInvolved.length === 0) && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-12 text-center text-sm text-muted-foreground"
                        >
                          No hay registros de activos para este movimiento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-secondary/10 py-4">
              <CardTitle className="text-lg font-mono">
                Certificados del Movimiento
              </CardTitle>
              <Button
                 variant="outline"
                 size="sm"
                 className="gap-2 bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                 onClick={() => alert("Funcionalidad para cargar certificados al movimiento pendiente de confirmación de DB.")}
               >
                 <Upload className="size-4" />
                 Cargar Certificado
              </Button>
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
                    {movement.certificates &&
                      movement.certificates.map((cert) => (
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
                              onClick={() => window.open(cert.fileUrl, "_blank")}
                            >
                              <FileText className="size-3 mr-1" />
                              Ver PDF
                            </Button>
                          </td>
                        </tr>
                      ))}
                    {(!movement.certificates ||
                      movement.certificates.length === 0) && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-sm text-muted-foreground"
                        >
                          No hay certificados registrados para este movimiento.
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
