import { TrazabilidadDashboard } from "./trazabilidad-dashboard";
import { TrazabilidadStats } from "../../domain/entities";

export function TrazabilidadContent({ stats }: { stats: TrazabilidadStats }) {
  return <div className="p-6"><TrazabilidadDashboard stats={stats} /></div>;
}
