import { Flame } from "lucide-react"

export function PetroLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 border border-primary/20">
        <Flame className="size-5 text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-foreground font-mono">
          PetroFlow
        </span>
        <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
          Energy Platform
        </span>
      </div>
    </div>
  )
}
