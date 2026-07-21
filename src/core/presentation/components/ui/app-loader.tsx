import Image from "next/image";

export function AppLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4 animate-pulse">
        <div className="relative size-16 flex items-center justify-center rounded-2xl bg-secondary/80 border border-border/50 shadow-xl p-3">
          <Image
            src="/icon.svg"
            alt="PetroFlow Logo"
            width={48}
            height={48}
            className="size-full object-contain"
            priority
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold tracking-wider text-foreground uppercase">
            PetroFlow
          </span>
          <span className="text-xs text-muted-foreground">
            Verificando sesión...
          </span>
        </div>
      </div>
    </div>
  );
}
