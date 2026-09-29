import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Asset,
  AssetStatus,
  TrazabilidadStats,
  AssetCertificate,
  JourneyStop,
  FunctionalPrincipleCatalog,
  AssetLocationStat,
  ReplacementMovementPayload,
  Movement
} from "../domain/entities";
import { ITrazabilidadRepository } from "../domain/repository";
import { uploadCertificateAction } from "./server/certificate-actions";

function nullableValue(value: unknown) {
  return value === "" || value === undefined ? null : value;
}

function assetPropertyValue(key: string, value: unknown) {
  const normalized = nullableValue(value);
  if (normalized === null) return null;
  if (/^property_(1[1-9]|20)$/.test(key)) {
    const numeric = Number(normalized);
    return Number.isNaN(numeric) ? null : numeric;
  }
  return normalized;
}

function relationRecord(relation: unknown): Record<string, any> {
  if (Array.isArray(relation)) return relation[0] ?? {};
  return relation && typeof relation === "object" ? relation as Record<string, any> : {};
}

async function mapCertificate(supabase: SupabaseClient, certificate: any): Promise<AssetCertificate> {
  let fileUrl = "";
  if (certificate.storage_path) {
    const { data } = await supabase.storage.from("certificates").createSignedUrl(certificate.storage_path, 3600);
    fileUrl = data?.signedUrl || "";
  }
  return {
    id: certificate.id,
    name: certificate.file_name || "Certificado",
    uploadDate: certificate.uploaded_at?.split("T")[0] || "",
    fileUrl,
  };
}

async function mapTransactionCertificates(supabase: SupabaseClient, links: any[] = []): Promise<AssetCertificate[]> {
  return Promise.all(links.map((link) => link.certificates).filter(Boolean).map((certificate) => mapCertificate(supabase, certificate)));
}

export class SupabaseTrazabilidadRepository implements ITrazabilidadRepository {
  constructor(private readonly supabase: SupabaseClient) { }

  private async getTransactionCertificateLinks(transactionIds: string[]): Promise<Record<string, any[]>> {
    if (transactionIds.length === 0) return {};

    const { data: links, error: linksError } = await this.supabase
      .from("transactions_certificates")
      .select("transaction_id, certificate_id")
      .in("transaction_id", transactionIds);
    if (linksError) throw linksError;

    const certificateIds = Array.from(new Set((links ?? []).map((link: any) => link.certificate_id)));
    if (certificateIds.length === 0) return {};

    const { data: certificates, error: certificatesError } = await this.supabase
      .from("certificates")
      .select("id, storage_path, file_name, uploaded_at")
      .in("id", certificateIds);
    if (certificatesError) throw certificatesError;

    const certificatesById = new Map((certificates ?? []).map((certificate: any) => [certificate.id, certificate]));
    return (links ?? []).reduce((result: Record<string, any[]>, link: any) => {
      const certificate = certificatesById.get(link.certificate_id);
      if (certificate) (result[link.transaction_id] ??= []).push({ certificates: certificate });
      return result;
    }, {});
  }

  async getFunctionalPrinciples(): Promise<FunctionalPrincipleCatalog[]> {
    const { data, error } = await this.supabase
      .from("functional_principles")
      .select("id, name, scopes:functional_principle_scopes(code), assets:assets!assets_function_principle_same_company_fkey!inner(id)")
      .eq("is_active", true)
      .eq("assets.is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching functional principles:", error);
      return [];
    }

    // Deduplicate as !inner may return multiple rows per principle if many assets exist
    const unique = Array.from(new Map((data || []).map((item: any) => [item.id, {
      id: item.id,
      name: item.name,
      type_code: Array.isArray(item.scopes) ? item.scopes[0]?.code : item.scopes?.code
    }])).values());

    return unique as FunctionalPrincipleCatalog[];
  }

  async getAssetStatsByFunctionalPrinciple(fpId: string): Promise<AssetLocationStat[]> {
    const { data, error } = await this.supabase
      .rpc("get_asset_stats_by_functional_principle", { fp_id: fpId });

    if (error) {
      console.error("Error fetching asset stats by functional principle:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      location_name: row.location_name,
      location_type: row.location_type,
      total_assets: Number(row.total_assets)
    }));
  }

  private mapAssetStatus(rawStatus: string): AssetStatus {
    return (rawStatus || "active") as AssetStatus;
  }

  async getAssetList(): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from("assets")
      .select(`
        *,
        brands:brand_id ( * ),
        models:model_id ( * ),
        functional_principles:function_principle_id ( *, scopes:functional_principle_scopes(code) ),
        locations:current_location_id ( * ),
        ubications:ubications!assets_company_id_current_ubication_id_fkey ( * )
      `);

    if (error) {
      console.error("Error fetching assets from Supabase", error);
      throw error;
    }

    return Promise.all((data || []).map((row: any) => this.mapRowToAsset(row)));
  }

  async getMovableAssetsByOriginLocation(locationId: string): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from("assets")
      .select(`
        *,
        brands:brand_id ( name ),
        models:model_id ( name ),
        functional_principles:function_principle_id ( name ),
        locations:current_location_id ( name ),
        ubications:ubications!assets_company_id_current_ubication_id_fkey ( name )
      `)
      .eq("is_active", true)
      .eq("current_location_id", locationId);

    if (error) throw error;
    return Promise.all((data || []).map((row: any) => this.mapRowToAsset(row)));
  }

  async getAssetsUnderInspection(): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from("assets")
      .select(`
        *,
        brands:brand_id ( name ),
        models:model_id ( name ),
        functional_principles:function_principle_id ( name ),
        locations:current_location_id ( name ),
        ubications:ubications!assets_company_id_current_ubication_id_fkey ( name )
      `)
      .eq("status", "under_inspection")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching assets under inspection", error);
      return [];
    }

    return Promise.all((data || []).map((row: any) => this.mapRowToAsset(row)));
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const { data, error } = await this.supabase
      .from("assets")
      .select(`
        *,
        brands:brand_id ( name ),
        models:model_id ( name ),
        functional_principles:function_principle_id (
          *,
          scopes:functional_principle_scopes (code)
        ),
        locations:current_location_id ( name ),
        ubications:ubications!assets_company_id_current_ubication_id_fkey ( name ),
        assets_certificates (
          certificates ( id, storage_path, file_name, uploaded_at )
        ),
        transaction_details (
          comments,
          transactions (
            id, type, date, justification, origin_location_id, destination_location_id,
            origin:locations!transactions_company_id_origin_location_id_fkey(name),
            destination:locations!transactions_company_id_destination_location_id_fkey(name),
            origin_ubication:ubications!transactions_company_id_origin_ubication_id_fkey(name),
            destination_ubication:ubications!transactions_company_id_destination_ubication_id_fkey(name)
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching asset ${id} from Supabase`, error);
      throw error;
    }
    if (!data) {
      return undefined;
    }

    const transactionIds = (data.transaction_details ?? [])
      .map((detail: any) => detail.transactions?.id)
      .filter(Boolean);
    const certificatesByTransaction = await this.getTransactionCertificateLinks(transactionIds);
    for (const detail of data.transaction_details ?? []) {
      const transaction = detail.transactions;
      if (transaction) transaction.transactions_certificates = certificatesByTransaction[transaction.id] ?? [];
    }

    return await this.mapRowToAsset(data);
  }

  async getDashboardStats(): Promise<TrazabilidadStats> {
    // For now, doing simple stats by pulling all basic assets
    // A better approach in production is using RPCs or aggregates, but this works for standard MVPs.
    const { data: assets, error } = await this.supabase
      .from("assets")
      .select(`
        id, status, serial_number,
        locations:current_location_id ( id, name, type )
      `)
      .eq("is_active", true);

    if (error || !assets) {
      return {
        totalAssets: 0,
        assetsOperational: 0,
        assetsUnderInspection: 0,
        assetsRejected: 0,
        distributionByLocation: [],
        movementsLast30Days: [],
        alerts: []
      };
    }

    let operationalCount = 0;
    let underInspectionCount = 0;
    let rejectedCount = 0;
    const distributionMap: Record<string, number> = {};

    assets.forEach((a: any) => {
      const locName = a.locations?.name || "Sin Location";
      if (a.status === "active") operationalCount++;
      if (a.status === "under_inspection") underInspectionCount++;
      if (a.status === "rejected") rejectedCount++;

      distributionMap[locName] = (distributionMap[locName] || 0) + 1;
    });

    const distributionByLocation = Object.entries(distributionMap).map(([name, value]) => ({ name, value }));

    return {
      totalAssets: assets.length,
      assetsOperational: operationalCount,
      assetsUnderInspection: underInspectionCount,
      assetsRejected: rejectedCount,
      distributionByLocation,
      movementsLast30Days: [], // Can be calculated from transactions
      alerts: [] // Compute alerts
    };
  }

  async registerMovement(assetId: string, movement: any): Promise<void> {
    return this.registerBulkMovement({ ...movement, assets: [{ asset_id: assetId, comments: movement.comments }] });
  }

  /** Registers the movement first, then creates one tenant-scoped link per certificate. */
  async registerBulkMovement(payload: any): Promise<void> {
    const { certificates, ...movementPayload } = payload;
    const { data: transactionId, error } = await this.supabase.rpc("register_bulk_movement", { p_payload: { ...movementPayload, date: new Date().toISOString() } });
    if (error) throw error;

    if (!certificates?.length) return;

    try {
      await this.uploadCertificates(undefined, certificates, transactionId);
    } catch (error) {
      throw new Error("Movement registered, but certificate upload failed", { cause: error });
    }
  }

  async registerReplacementMovement(payload: ReplacementMovementPayload): Promise<void> {
    const { error } = await this.supabase.rpc("register_replacement_movement", { p_payload: payload });
    if (error) throw error;
  }

  /** Uploads certificates and links them to an asset or movement through the tenant server action. */
  private async uploadCertificates(assetId: string | undefined, certificates: { file: File; name: string }[], transactionId?: string): Promise<string[]> {
    return Promise.all(certificates.map((certificate) => uploadCertificateAction(certificate.file, certificate.name, assetId, transactionId)));
  }

  async addCertificate(assetId: string, certificates: { file: File; name: string }[]): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error("No user authenticated");

    // Upload and get cert ids
    await this.uploadCertificates(assetId, certificates);

  }

  async registerAsset(asset: Partial<Asset>): Promise<void> {
    const rawAsset = asset as any;
    const payload = {
      brand_id: nullableValue(rawAsset.brand_id),
      model_id: nullableValue(rawAsset.model_id),
      company_id: rawAsset.company_id,
      serial_number: rawAsset.serial_number || rawAsset.serialNumber,
      status: rawAsset.status, // formData passes "active", "under_inspection", "rejected"
      function_principle_id: rawAsset.function_principle_id,
      current_location_id: rawAsset.current_location_id,
      current_ubication_id: nullableValue(rawAsset.current_ubication_id),
      capacity: nullableValue(rawAsset.capacity),
      last_inspection_code: nullableValue(rawAsset.last_inspection_code),
      ...Array.from({ length: 20 }, (_, i) => `property_${i + 1}`).reduce((acc: any, key) => {
        if (rawAsset[key] !== undefined && rawAsset[key] !== "") {
          acc[key] = assetPropertyValue(key, rawAsset[key]);
        }
        return acc;
      }, {})
    };

    const { error } = await this.supabase.from("assets").insert(payload);
    if (error) {
      console.error("Error registering asset:", error);
      throw error;
    }
  }

  async updateAsset(id: string, asset: Partial<Asset>): Promise<void> {
    const rawAsset = asset as any;
    const payload = {
      brand_id: nullableValue(rawAsset.brand_id),
      model_id: nullableValue(rawAsset.model_id),
      serial_number: rawAsset.serial_number || rawAsset.serialNumber,
      status: rawAsset.status,
      // intentionally omit function_principle_id since it shouldn't be altered
      current_ubication_id: nullableValue(rawAsset.current_ubication_id),
      capacity: nullableValue(rawAsset.capacity),
      last_inspection_code: nullableValue(rawAsset.last_inspection_code),
      ...(rawAsset.current_location_id
        ? { current_location_id: rawAsset.current_location_id }
        : {}),
      ...Array.from({ length: 20 }, (_, i) => `property_${i + 1}`).reduce((acc: any, key) => {
        // Here we can save empty strings to reset properties if needed, but we'll stick to updating provided keys
        if (rawAsset[key] !== undefined) {
          acc[key] = assetPropertyValue(key, rawAsset[key]);
        }
        return acc;
      }, {})
    };

    const { error } = await this.supabase.from("assets").update(payload).eq("id", id);
    if (error) {
      console.error("Error updating asset:", error);
      throw error;
    }
  }

  async disableAsset(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("assets")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Error disabling asset:", error);
      throw error;
    }
  }

  async getMovementList(): Promise<Movement[]> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select(`
        id, type, date, justification, created_at,
        origin:locations!transactions_company_id_origin_location_id_fkey(name),
        destination:locations!transactions_company_id_destination_location_id_fkey(name),
        origin_ubication:ubications!transactions_company_id_origin_ubication_id_fkey(name),
        destination_ubication:ubications!transactions_company_id_destination_ubication_id_fkey(name),
        users:created_by(name),
         transaction_details (
           comments,
           assets ( id, serial_number, brands:brand_id(name), models:model_id(name) )
         )
       `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching movements from Supabase", error);
      throw error;
    }

    return Promise.all((data || []).map(async (row: any) => {
      const details = row.transaction_details || [];
      const assetsInvolved = details.map((d: any) => ({
        asset_id: d.assets?.id || "",
        asset_code: d.assets?.serial_number || "Sin SN",
        asset_name: `${d.assets?.brands?.name || ""} ${d.assets?.models?.name || ""}`.trim() || "Activo",
        comments: d.comments
      }));

      return {
        id: row.id,
        type: row.type,
        date: row.date || row.created_at,
        justification: row.justification || "",
        originLocationName: row.origin?.name || "Sin origen",
        originUbicationName: row.origin_ubication?.name || "Sin base",
        destinationLocationName: row.destination?.name || "Sin destino",
        destinationUbicationName: row.destination_ubication?.name || "Sin destino ub.",
        assetsInvolvedCount: assetsInvolved.length,
        assetsInvolved,
        createdBy: row.users?.name || "Sistema",
        certificates: []
      };
    }));
  }

  async getMovementById(id: string): Promise<Movement | undefined> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select(`
        id, type, date, justification, created_at,
        origin:locations!transactions_company_id_origin_location_id_fkey(name),
        destination:locations!transactions_company_id_destination_location_id_fkey(name),
        origin_ubication:ubications!transactions_company_id_origin_ubication_id_fkey(name),
        destination_ubication:ubications!transactions_company_id_destination_ubication_id_fkey(name),
        users:created_by(name),
        transaction_details ( comments, assets ( id, serial_number, brands:brand_id(name), models:model_id(name) ) )
      `)
      .eq("id", id)
      .single();
    if (error || !data) {
      if (error) console.error(`Error fetching movement ${id} from Supabase`, error);
      return undefined;
    }
    const row: any = data;
    const certificatesByTransaction = await this.getTransactionCertificateLinks([row.id]);
    const details = row.transaction_details || [];
    return {
      id: row.id, type: row.type, date: row.date || row.created_at, justification: row.justification || "",
      originLocationName: row.origin?.name || "Sin origen", originUbicationName: row.origin_ubication?.name || "Sin base",
      destinationLocationName: row.destination?.name || "Sin destino", destinationUbicationName: row.destination_ubication?.name || "Sin destino ub.",
      assetsInvolvedCount: details.length,
      assetsInvolved: details.map((d: any) => ({ asset_id: d.assets?.id || "", asset_code: d.assets?.serial_number || "Sin SN", asset_name: `${d.assets?.brands?.name || ""} ${d.assets?.models?.name || ""}`.trim() || "Activo", comments: d.comments })),
      createdBy: row.users?.name || "Sistema",
      certificates: await mapTransactionCertificates(this.supabase, certificatesByTransaction[row.id] ?? []),
    };
  }

  private async mapRowToAsset(row: any): Promise<Asset> {
    const brandRelation = relationRecord(row.brands);
    const modelRelation = relationRecord(row.models);
    const locationRelation = relationRecord(row.locations);
    const ubicationRelation = relationRecord(row.ubications);
    const brand = brandRelation.name || "Sin marca";
    const model = modelRelation.name || "Sin modelo";
    const serialNumber = row.serial_number || "Sin SN";
    const functionalPrincipleRelation = relationRecord(row.functional_principles);
    const functionalPrinciple = functionalPrincipleRelation.name || "Componente";
    const currentLocation = locationRelation.name || "Base";

    // Map properties
    const properties: any[] = [];
    if (row.functional_principles) {
      for (let i = 1; i <= 20; i++) {
        const propKey = `property_${i}`;
        const label = row.functional_principles[propKey];
        const value = row[propKey];

        if (label && value !== null && value !== undefined && value !== "") {
          properties.push({
            key: propKey,
            label,
            value
          });
        }
      }
    }

    // Extract certificates from the M2M nested relationship
    const directCerts = (row.assets_certificates || [])
      .map((ac: any) => ac.certificates)
      .filter((c: any) => c != null);
    const movementCerts = (row.transaction_details || [])
      .flatMap((detail: any) => detail.transactions?.transactions_certificates || [])
      .map((link: any) => link.certificates)
      .filter((c: any) => c != null);
    const rawCerts = Array.from(new Map([...directCerts, ...movementCerts].map((certificate: any) => [certificate.id, certificate])).values());

    const certificates: AssetCertificate[] = await Promise.all(
      rawCerts.map((certificate: any) => mapCertificate(this.supabase, certificate))
    );

    // Map journey stops from transaction_details
    const journey: JourneyStop[] = (row.transaction_details || [])
      .sort((a: any, b: any) => {
        const dateA = new Date(a.transactions?.date || 0).getTime();
        const dateB = new Date(b.transactions?.date || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      })
      .map((td: any) => {
        const tx = td.transactions || {};
        const oName = tx.origin?.name || "Origen";
        const dName = tx.destination?.name || "Destino";
        const oUbication = tx.origin_ubication?.name;
        const dUbication = tx.destination_ubication?.name;

        let locationDisplay = dName;
        let originDisplay = oName !== dName ? oName : undefined;

        if (tx.type === 'reubication' || tx.type === 'replacement') {
          locationDisplay = dUbication || "Destino";
          originDisplay = `${oName} | ${oUbication || "Origen"}`;
        }

        return {
          id: tx.id || Date.now().toString(),
          provider: dName,
          location: locationDisplay,
          originLocation: originDisplay,
          service: tx.type === 'transfer' ? "Traslado" : tx.type === 'replacement' ? "Reemplazo" : "Reubicación",
          dateIn: tx.date ? tx.date.split("T")[0] : "",
          dateOut: null,
          status: "completed",
          notes: td.comments || tx.justification || "",
          responsible: tx.users?.name || "Sistema"
        };
      });

    return {
      id: row.id,
      code: serialNumber, // Fallback code
      functionalPrinciple: functionalPrinciple as any,
      function_principle_id: row.function_principle_id || functionalPrincipleRelation.id,
      brand: brand,
      model: model,
      brand_id: row.brands?.id,
      model_id: row.models?.id,
      capacity: row.capacity,
      lastInspectionCode: row.last_inspection_code,
      serialNumber: serialNumber,
      currentLocation: currentLocation,
      current_location_id: row.current_location_id || locationRelation.id,
      position: ubicationRelation.name || "N/A",
      current_ubication_id: row.current_ubication_id || ubicationRelation.id,
      status: this.mapAssetStatus(row.status),
      is_active: row.is_active,
      lastMovementDate: row.updated_at ? row.updated_at.split("T")[0] : "N/A",
      createdAt: row.created_at ? row.created_at.split("T")[0] : "N/A",
      name: `${brand} ${model}`,
      type: functionalPrinciple,
      type_code: Array.isArray(row.functional_principles?.scopes)
        ? row.functional_principles?.scopes[0]?.code
        : row.functional_principles?.scopes?.code,
      properties,
      journey,
      certificates
    };
  }
}
