"use client";
import { useEffect, useState } from "react";
import { Button } from "@/src/core/presentation/components/ui/button";
import { readMaintenanceThresholds, saveMaintenanceThresholds } from "../../infrastructure/server/hour-meter-actions";

export function validateMaintenanceThresholds(values: readonly string[]): number[] | string {
  const thresholds = values.map(Number);
  return thresholds.some((value) => !Number.isInteger(value) || value <= 0) || new Set(thresholds).size !== thresholds.length
    ? "Los umbrales deben ser horas enteras positivas y no repetidas."
    : thresholds;
}

export function MaintenanceThresholdModal({ principles, canEdit, onSaved }: { principles: Array<{ id: string; name: string }>; canEdit: boolean; onSaved?: () => void }) {
  const [principleId, setPrincipleId] = useState(principles[0]?.id ?? "");
  const [values, setValues] = useState<string[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!principleId) return; setLoading(true); setError(null); void readMaintenanceThresholds(principleId).then((result) => { if (result.ok) setValues(result.data.map((x) => String(x.thresholdHours))); else setError(result.error); }).finally(() => setLoading(false)); }, [principleId]);
  async function save() { const validated = validateMaintenanceThresholds(values); if (typeof validated === "string") { setError(validated); return; } setLoading(true); const result = await saveMaintenanceThresholds(principleId, validated); setError(result.ok ? null : result.error); setLoading(false); if (result.ok) onSaved?.(); }
  return <div className="space-y-4"><select aria-label="Principio funcional" className="h-9 w-full rounded-md border bg-background px-2" value={principleId} onChange={(e) => setPrincipleId(e.target.value)}>{principles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>{loading ? <div aria-busy="true" className="h-24 animate-pulse rounded bg-muted" /> : <div className="space-y-2">{values.map((value, index) => <input key={index} aria-label={`Umbral ${index + 1}`} disabled={!canEdit} className="h-9 w-full rounded-md border bg-background px-2" type="number" min="1" value={value} onChange={(e) => setValues((current) => current.map((x, i) => i === index ? e.target.value : x))} />)}{canEdit && <Button variant="outline" onClick={() => setValues((current) => [...current, ""])}>Agregar umbral</Button>}</div>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{canEdit && <Button disabled={loading} onClick={() => void save()}>Guardar configuración</Button>}</div>;
}
