import { Skeleton } from "@/src/core/presentation/components/ui/skeleton";

function FilterSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/20 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className={index === fields - 1 ? "flex min-w-[250px] flex-1 flex-col gap-1.5" : "flex w-40 flex-col gap-1.5"}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

function TableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid gap-4 bg-secondary/50 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-24" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 px-4 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton key={columnIndex} className={columnIndex === columns - 1 ? "ml-auto h-4 w-10" : "h-4 w-full max-w-32"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton({ kind }: { kind: "asset" | "movement" }) {
  return (
    <div className="flex flex-col gap-6 py-6">
      <Skeleton className="h-5 w-36" />
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: kind === "asset" ? 2 : 4 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
      </section>
      <div className="flex gap-8 border-b border-border">
        {Array.from({ length: kind === "asset" ? 3 : 2 }).map((_, index) => (
          <Skeleton key={index} className="mb-4 h-5 w-36" />
        ))}
      </div>
      <section className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="mb-8 h-6 w-44" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Route fallback for the Trazabilidad dashboard segment. */
export function TrazabilidadDashboardLoading() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <section className="rounded-xl border border-border bg-card p-6 md:col-span-5 lg:col-span-4">
          <Skeleton className="h-5 w-48" />
          <div className="flex h-[320px] items-center justify-center">
            <Skeleton className="size-40 rounded-full" />
          </div>
          <div className="flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-3 w-20" />)}
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-6 md:col-span-7 lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 flex-1" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="mb-4 h-5 w-56" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
        </div>
      </section>
    </div>
  );
}

/** Route fallback for the Trazabilidad assets list segment. */
export function TrazabilidadAssetsLoading() {
  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex justify-end"><Skeleton className="h-10 w-40" /></div>
      <FilterSkeleton fields={5} />
      <TableSkeleton columns={7} />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

/** Route fallback for the Trazabilidad movements list segment. */
export function TrazabilidadMovementsLoading() {
  return (
    <div className="flex flex-col gap-4 py-6">
      <FilterSkeleton fields={2} />
      <TableSkeleton columns={7} />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}

/** Route fallback for a Trazabilidad asset detail route. */
export function TrazabilidadAssetDetailLoading() {
  return <DetailSkeleton kind="asset" />;
}

/** Route fallback for a Trazabilidad movement detail route. */
export function TrazabilidadMovementDetailLoading() {
  return <DetailSkeleton kind="movement" />;
}
