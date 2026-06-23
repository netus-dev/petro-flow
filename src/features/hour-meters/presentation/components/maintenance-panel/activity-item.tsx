import { Clock } from "lucide-react";
import { MaintenanceActivity, MaintenanceCategory } from "../../../domain/entities";

/**
 * Props para el componente ActivityItem.
 */
export interface ActivityItemProps {
  /** Actividad de mantenimiento a renderizar. */
  activity: MaintenanceActivity;
}

// Estilos visuales personalizados y etiquetas para cada categoría de mantenimiento
const CATEGORY_STYLES: Record<MaintenanceCategory, { label: string; classes: string }> = {
  lubricacion: { label: "Lubricación", classes: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  inspeccion: { label: "Inspección", classes: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  sustitucion: { label: "Sustitución", classes: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  calibracion: { label: "Calibración", classes: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  limpieza: { label: "Limpieza", classes: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  otro: { label: "Otro", classes: "text-muted-foreground bg-muted border-border/40" }
};

/**
 * Átomo de UI que representa una actividad individual en la lista de planes de mantenimiento.
 * Muestra el nombre de la actividad, descripción, categoría con badge de color y duración.
 */
export function ActivityItem({ activity }: ActivityItemProps) {
  const style = CATEGORY_STYLES[activity.category] || CATEGORY_STYLES.otro;

  return (
    <div className="bg-card/45 border border-border/60 rounded-xl p-3.5 hover:border-border/90 hover:bg-card/60 transition-all duration-300 shadow-sm flex flex-col gap-2 relative group">
      <div className="flex items-start justify-between gap-2.5">
        <h4 className="text-xs font-bold text-foreground leading-tight tracking-wide font-mono uppercase group-hover:text-primary transition-colors">
          {activity.name}
        </h4>
        <span className={`text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border shrink-0 ${style.classes}`}>
          {style.label}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
        {activity.description}
      </p>
      {activity.estimatedDuration && (
        <div className="flex items-center gap-1.5 mt-1 pt-1.5 border-t border-border/30 text-[9px] font-mono text-muted-foreground/80">
          <Clock className="size-3 text-muted-foreground/60" />
          <span>Duración estimada: <strong className="text-foreground/90">{activity.estimatedDuration}</strong></span>
        </div>
      )}
    </div>
  );
}
