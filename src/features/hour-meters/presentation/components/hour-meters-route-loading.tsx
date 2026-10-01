import { Skeleton } from "@/src/core/presentation/components/ui/skeleton";

/** Route fallback for the Hour Meters dashboard. */
export function HourMetersDashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-7rem)] w-full flex-col overflow-hidden bg-background">
      <div className="flex min-h-16 items-center justify-between border-b border-border px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 p-4 md:p-6 lg:p-8">
        <div className="relative flex min-h-0 flex-1 flex-row gap-4 overflow-hidden">
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-visible p-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <section key={index} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-2 w-full" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              </section>
            ))}
          </div>

          <aside className="hidden h-full w-[440px] shrink-0 lg:block">
            <div className="h-full rounded-xl border border-border bg-card p-6">
              <Skeleton className="mb-6 h-6 w-48" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 w-full" />)}
              </div>
              <Skeleton className="mt-8 h-5 w-40" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/** Route fallback for the Hour Meter registration form. */
export function RegisterHourMeterLoading() {
  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <header className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-64" />
        </div>
      </header>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
    </main>
  );
}
