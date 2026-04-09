"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  FileSearch, 
  MapPin, 
  Wrench,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/core/presentation/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/core/presentation/components/ui/table";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { Skeleton } from "@/src/core/presentation/components/ui/skeleton";
import { Asset } from "../../domain/entities";
import { GetAssetsUnderInspectionUseCase } from "../../application/use-cases";
import { trazabilidadRepository } from "../../infrastructure/repository";

// Dependency Injection
const getAssetsUnderInspectionUseCase = new GetAssetsUnderInspectionUseCase(trazabilidadRepository);

/**
 * TrazabilidadAssetsInspection Component
 * Displays a table of assets currently in 'under_inspection' status.
 * Following Clean Architecture: UI -> Use Case -> Repository
 */
export function TrazabilidadAssetsInspection() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getAssetsUnderInspectionUseCase.execute();
        setAssets(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching assets under inspection:", err);
        setError("No se pudieron cargar los activos para inspección.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="flex items-center gap-3 py-6 text-red-500">
          <AlertCircle className="size-5" />
          <p className="text-sm font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm font-semibold font-mono flex items-center gap-2 text-foreground">
            <Search className="size-4 text-primary" />
            Activos para Inspección
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Listado general de activos pendientes de inspección
          </CardDescription>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] uppercase tracking-wider">
          {isLoading ? "Cargando..." : `${assets.length} pendientes`}
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full bg-secondary/50" />
            <Skeleton className="h-12 w-full bg-secondary/30" />
            <Skeleton className="h-12 w-full bg-secondary/30" />
            <Skeleton className="h-12 w-full bg-secondary/30" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="size-12 rounded-full bg-secondary/50 flex items-center justify-center">
              <FileSearch className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Sin pendientes</p>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                No hay activos marcados para inspección en este momento.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground h-10">Principio Funcional</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground h-10">Serie</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground h-10">Última Inspección</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground h-10">Rig Actual</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground h-10">Ubicación Actual</TableHead>
                  <TableHead className="text-right h-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id} className="group border-border/40 hover:bg-secondary/30 transition-colors">
                    <TableCell className="py-3">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase font-mono tracking-tighter">
                        {asset.functionalPrinciple}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                          {asset.serialNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="size-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground/80">
                          {asset.lastInspectionCode || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3 text-primary/70" />
                        <span className="text-xs text-foreground/80">
                          {asset.currentLocation}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {asset.position}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <button className="p-1 px-2 rounded hover:bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all">
                        <ExternalLink className="size-3" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
