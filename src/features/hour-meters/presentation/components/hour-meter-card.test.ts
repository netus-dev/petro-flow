import { describe, expect, it } from "vitest";
import { getFunctionalPrincipleAccent, getMaintenanceBadge } from "./hour-meter-card";

describe("getFunctionalPrincipleAccent", () => {
  it("uses the configured accent for the functional principle", () => {
    expect(getFunctionalPrincipleAccent("Bomba de Lodo")).toEqual({ rail: "border-l-teal-500", progress: "bg-teal-500" });
  });

  it("does not infer an accent from equipment names or unknown labels", () => {
    expect(getFunctionalPrincipleAccent("Equipo Bomba de Lodo")).toEqual({ rail: "border-l-slate-400", progress: "bg-primary" });
    expect(getFunctionalPrincipleAccent()).toEqual({ rail: "border-l-slate-400", progress: "bg-primary" });
  });
});

describe("getMaintenanceBadge", () => {
  it.each([
    [{ remainingHours: 500, isCritical: false, isWarning: false }, "Normal"],
    [{ remainingHours: 300, isCritical: false, isWarning: true }, "Próximo a Mantenimiento"],
    [{ remainingHours: 100, isCritical: true, isWarning: false }, "Mantenimiento Crítico"],
    [{ remainingHours: 0, isCritical: true, isWarning: false }, "Mantenimiento vencido"],
    [{ remainingHours: null, isCritical: false, isWarning: false }, "Sin configuración"],
  ])("shows the expected state", (record, text) => {
    expect(getMaintenanceBadge(record)).toMatchObject({ text });
  });

  it("gives critical severity precedence over warning", () => {
    expect(getMaintenanceBadge({ remainingHours: 100, isCritical: true, isWarning: true }).text).toBe("Mantenimiento Crítico");
  });
});
