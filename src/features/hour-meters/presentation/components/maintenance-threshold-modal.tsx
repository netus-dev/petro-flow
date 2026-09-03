"use client";
import { useEffect, useState } from "react";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Trash2 } from "lucide-react";
import { readMaintenanceThresholds, saveMaintenanceThresholds } from "../../infrastructure/server/hour-meter-actions";

export function validateMaintenanceThresholds(values: readonly string[]): number[] | string {
  const thresholds = values.map(Number);
  return thresholds.some((value) => !Number.isInteger(value) || value <= 0) || new Set(thresholds).size !== thresholds.length
    ? "Los umbrales deben ser horas enteras positivas y no repetidas."
    : thresholds;
}

/** Returns the stable content state shown after a threshold request completes. */
export function getMaintenanceThresholdContentState(values: readonly string[], loading: boolean): "loading" | "empty" | "configured" {
  if (loading) return "loading";
  return values.length === 0 ? "empty" : "configured";
}

/** Removes one threshold without mutating the current form values. */
export function removeMaintenanceThreshold(values: readonly string[], index: number): string[] {
  return values.filter((_, valueIndex) => valueIndex !== index);
}

export function MaintenanceThresholdModal({ principles, canEdit, onSaved }: { principles: Array<{ id: string; name: string }>; canEdit: boolean; onSaved?: () => void }) {
  const [principleId, setPrincipleId] = useState(principles[0]?.id ?? "");
  const [values, setValues] = useState<string[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!principleId) return; setLoading(true); setError(null); void readMaintenanceThresholds(principleId).then((result) => { if (result.ok) setValues(result.data.map((x) => String(x.thresholdHours))); else setError(result.error); }).finally(() => setLoading(false)); }, [principleId]);
  async function save() { const validated = validateMaintenanceThresholds(values); if (typeof validated === "string") { setError(validated); return; } setLoading(true); const result = await saveMaintenanceThresholds(principleId, validated); setError(result.ok ? null : result.error); setLoading(false); if (result.ok) onSaved?.(); }
  const contentState = getMaintenanceThresholdContentState(values, loading);
  return <div className="space-y-4"><select aria-label="Principio funcional" className="h-9 w-full rounded-md border bg-background px-2" value={principleId} onChange={(e) => setPrincipleId(e.target.value)}>{principles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><div aria-busy={loading} className="relative min-h-24 space-y-2">{contentState === "loading" && <div aria-label="Cargando umbrales" className="absolute inset-0 z-10 animate-pulse rounded bg-muted/80" />}{contentState === "empty" ? <p className="text-sm text-muted-foreground">No hay umbrales configurados para este principio funcional.</p> : values.map((value, index) => <div key={index} className="flex items-center gap-2"><input aria-label={`Umbral ${index + 1}`} disabled={!canEdit || loading} className="h-9 w-full rounded-md border bg-background px-2" type="number" min="1" value={value} onChange={(e) => setValues((current) => current.map((x, i) => i === index ? e.target.value : x))} />{canEdit && <Button type="button" aria-label={`Eliminar umbral ${index + 1}`} size="icon-sm" variant="ghost" disabled={loading} onClick={() => setValues((current) => removeMaintenanceThreshold(current, index))}><Trash2 /></Button>}</div>)}{canEdit && <Button variant="outline" disabled={loading} onClick={() => setValues((current) => [...current, ""])}>Agregar umbral</Button>}</div>{!canEdit && <p className="text-sm text-muted-foreground">Solo lectura: no tienes permisos para editar la configuración.</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{canEdit && <Button disabled={loading} onClick={() => void save()}>Guardar configuración</Button>}</div>;
}
