"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Movement } from "../../domain/entities";
import { MovementTable } from "./movement-table";
import { filterMovements, parseMovementFilters, serializeFilters } from "../lib/url-filters";

export function TrazabilidadMovementsPage({ movements }: { movements: Movement[] }) {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const filters = parseMovementFilters(new URLSearchParams(params.toString()));
  const update = (key: string, value: string) => { const next = serializeFilters({ ...filters, [key]: value }); router.replace(`${pathname}${next.size ? `?${next}` : ""}`); };
  return <div className="p-6"><MovementTable movements={filterMovements(movements, filters)} search={filters.search} typeFilter={filters.type}
    onSearchChange={(v) => update("search", v)} onTypeChange={(v) => update("type", v)} onViewDetail={(movement) => router.push(`/trazabilidad/movements/${movement.id}`)} /></div>;
}
