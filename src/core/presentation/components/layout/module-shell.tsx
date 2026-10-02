import type { ReactNode } from "react";
import { cn } from "@/src/core/utils/utils";

interface ModuleShellProps {
  header: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Shared shell that keeps module chrome outside the module content scroll area. */
export function ModuleShell({ header, children, className, contentClassName }: ModuleShellProps) {
  return (
    <section className={cn("flex h-full min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="shrink-0">{header}</div>
      <main className={cn("min-h-0 flex-1 overflow-y-auto", contentClassName)}>{children}</main>
    </section>
  );
}
