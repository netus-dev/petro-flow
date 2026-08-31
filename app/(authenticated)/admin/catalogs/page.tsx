import { CatalogsContent } from "@/src/features/catalogs/presentation/components/catalogs-content";
import { readCatalog } from "@/src/features/catalogs/infrastructure/server/catalog-server";

export default async function CatalogsPage() {
  const result = await readCatalog("companies");
  return <CatalogsContent initialItems={result.ok ? result.data : []} initialError={result.ok ? null : result.error} />;
}
