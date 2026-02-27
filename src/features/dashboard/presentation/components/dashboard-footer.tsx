"use client"

import { Flame } from "lucide-react"
import { useApp } from "@/src/core/presentation/providers/providers"

export function DashboardFooter() {
  const { t } = useApp()

  return (
    <footer className="flex items-center justify-between border-t border-border bg-background/50 px-6 py-3">
      <div className="flex items-center gap-2">
        <Flame className="size-3.5 text-primary/60" />
        <span className="text-[10px] text-muted-foreground tracking-wide">
          PetroFlow Energy Platform v2.4.1
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <span className="text-[10px] text-muted-foreground">
          {t("footer.last_sync")} 2 min
        </span>
        <div className="h-3 w-px bg-border" />
        <span className="text-[10px] text-muted-foreground">
          {'2026 PetroFlow. '}{t("footer.rights")}
        </span>
      </div>
    </footer>
  )
}
