"use client";

import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import { useHourMeters } from "../hooks/use-hour-meters";

export function formatPrevious(value: number | null | undefined, unit: string) {
  return value == null ? "sin registro" : `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${unit}`;
}

function preventNegativeInput(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "-" || event.key === "Subtract") event.preventDefault();
}

export interface RegisterHourMeterFormProps { onRegistered?: () => void; }

/** Form for a single manual reading, reusable by the route and dashboard modal. */
export function RegisterHourMeterForm({ onRegistered }: RegisterHourMeterFormProps) {
  const { addRecord, records } = useHourMeters();
  const [equipmentId, setEquipmentId] = useState("");
  const [capturedAt, setCapturedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [currentReading, setCurrentReading] = useState("");
  const [diesel, setDiesel] = useState("");
  const [mw, setMw] = useState("");
  const [mvar, setMvar] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const selectedRecord = records.find((record) => record.assetId === equipmentId);
  const lastRegistered = selectedRecord;

  useEffect(() => {
    setCurrentReading(""); setDiesel(""); setMw(""); setMvar("");
    setSuccess(false); setError(null); setFieldErrors({});
  }, [equipmentId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setSuccess(false);
    const result = await addRecord({ assetId: equipmentId, capturedAt, currentReading: Number(currentReading), dieselAccumulatedGallons: Number(diesel), dailyMwAccumulated: Number(mw), dailyMvarAccumulated: Number(mvar) });
    setSaving(false);
    if (result.error) { setError(result.error); setFieldErrors(result.errorFieldErrors ?? {}); return; }
    setError(null); setFieldErrors({}); setSuccess(true); onRegistered?.();
  }

  return <form onSubmit={submit} className="min-w-0 space-y-4">
    {lastRegistered && <p role="status" className="rounded-md bg-emerald-500/10 p-2 text-xs text-emerald-700">Registro completado: este activo tiene una lectura registrada previamente.</p>}
    <div className="space-y-2 min-w-0">
      <Label htmlFor="equipment">Activo / Equipo</Label>
      <select id="equipment" required value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className="border-input bg-background box-border flex h-9 w-full min-w-0 max-w-full rounded-md border px-3 text-sm"><option value="">Selecciona un equipo</option>{records.map((record) => <option key={record.id} value={record.id}>{record.equipment}</option>)}</select>
      {fieldErrors.assetId && <p className="text-xs text-destructive">{fieldErrors.assetId}</p>}
    </div>
    <div className="space-y-2 min-w-0">
    <Label htmlFor="capturedAt">Fecha y hora de captura</Label>
    <div className="w-full min-w-0 max-w-full box-border"><Input id="capturedAt" className="w-full min-w-0 max-w-full box-border" type="datetime-local" required value={capturedAt} onChange={(e) => setCapturedAt(e.target.value)} /></div>
    {fieldErrors.capturedAt && <p className="text-xs text-destructive">{fieldErrors.capturedAt}</p>}
    </div>
    <div className="space-y-3 min-w-0"><div className="space-y-2"><Label htmlFor="reading">Horómetro actual <span className="text-muted-foreground">(último: {formatPrevious(lastRegistered?.currentReading, "horas")})</span></Label><Input className="w-full min-w-0 max-w-full box-border" id="reading" onKeyDown={preventNegativeInput} type="number" min="0" step="1" required value={currentReading} onChange={(e) => setCurrentReading(e.target.value)} />{fieldErrors.currentReading && <p className="text-xs text-destructive">{fieldErrors.currentReading}</p>}</div><div className="space-y-2"><Label htmlFor="diesel">Diésel acumulado <span className="text-muted-foreground">(último: {formatPrevious(lastRegistered?.dieselAccumulatedGallons, "galones")})</span></Label><Input className="w-full min-w-0 max-w-full box-border" id="diesel" onKeyDown={preventNegativeInput} type="number" min="0" step="1" required value={diesel} onChange={(e) => setDiesel(e.target.value)} />{fieldErrors.dieselAccumulatedGallons && <p className="text-xs text-destructive">{fieldErrors.dieselAccumulatedGallons}</p>}</div><div className="space-y-2"><Label htmlFor="mw">MW diario acumulado <span className="text-muted-foreground">(último: {formatPrevious(lastRegistered?.dailyMwAccumulated, "MW")})</span></Label><Input className="w-full min-w-0 max-w-full box-border" id="mw" onKeyDown={preventNegativeInput} type="number" min="0" step="0.1" required value={mw} onChange={(e) => setMw(e.target.value)} />{fieldErrors.dailyMwAccumulated && <p className="text-xs text-destructive">{fieldErrors.dailyMwAccumulated}</p>}</div><div className="space-y-2"><Label htmlFor="mvar">MVAR diario acumulado <span className="text-muted-foreground">(último: {formatPrevious(lastRegistered?.dailyMvarAccumulated, "MVAR")})</span></Label><Input className="w-full min-w-0 max-w-full box-border" id="mvar" onKeyDown={preventNegativeInput} type="number" min="0" step="0.1" required value={mvar} onChange={(e) => setMvar(e.target.value)} />{fieldErrors.dailyMvarAccumulated && <p className="text-xs text-destructive">{fieldErrors.dailyMvarAccumulated}</p>}</div></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {success && <p role="status" className="text-sm text-emerald-600">Registro guardado correctamente.</p>}
    <Button type="submit" disabled={saving} className="w-full">{saving ? "Guardando..." : "Guardar Registro"}</Button>
  </form>;
}
