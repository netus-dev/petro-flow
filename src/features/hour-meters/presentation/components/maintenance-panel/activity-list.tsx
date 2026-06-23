import { CheckCircle2 } from "lucide-react";
import { MaintenanceActivity } from "../../../domain/entities";
import { ActivityItem } from "./activity-item";

/**
 * Props para el componente ActivityList.
 */
export interface ActivityListProps {
  /** Colección de actividades a listar. */
  activities: MaintenanceActivity[];
}

/**
 * Componente molécula que agrupa y renderiza una lista de actividades de mantenimiento.
 * Maneja el estado vacío diferenciado e implementa scroll.
 */
export function ActivityList({ activities }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 border border-dashed border-border/60 rounded-xl">
        <CheckCircle2 className="size-8 text-emerald-500/60 mb-2.5" />
        <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
          Plan definido sin tareas
        </h4>
        <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1.5 leading-relaxed font-medium">
          Este plan de mantenimiento actualmente no registra actividades individuales asociadas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-full overflow-y-auto pr-1">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
