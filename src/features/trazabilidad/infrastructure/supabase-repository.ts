import { createClient } from "@/src/core/lib/supabase/client";
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

export class SupabaseTrazabilidadRepository implements ITrazabilidadRepository {
  private supabase = createClient();

  async getFunctionalPrinciples(): Promise<FunctionalPrincipleCatalog[]> {
    const { data, error } = await this.supabase
      .from("functional_principles")
      .select("id, name, scopes:functional_principle_scopes(code), assets!inner(id)")
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
        ubications:current_ubication_id ( * ),
        assets_certificates (
          certificates ( id, storage_path, file_name, uploaded_at )
        ),
        transaction_details (
          comments,
          transactions (
            id, type, date, justification, origin_location_id, destination_location_id,
            origin:locations!fk_origin_location(name),
            destination:locations!fk_destination_location(name),
            origin_ubication:ubications!transactions_origin_ubication_id_fkey(name),
            destination_ubication:ubications!transactions_destination_ubication_id_fkey(name),
            users:created_by(name)
          )
        )
      `);

    if (error) {
      console.error("Error fetching assets from Supabase", error);
      return [];
    }

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
        ubications:current_ubication_id ( name )
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
        functional_principles:function_principle_id ( *, scopes:functional_principle_scopes(code) ),
        locations:current_location_id ( name ),
        ubications:current_ubication_id ( name ),
        assets_certificates (
          certificates ( id, storage_path, file_name, uploaded_at )
        ),
        transaction_details (
          comments,
          transactions (
            id, type, date, justification, origin_location_id, destination_location_id,
            origin:locations!fk_origin_location(name),
            destination:locations!fk_destination_location(name),
            origin_ubication:ubications!transactions_origin_ubication_id_fkey(name),
            destination_ubication:ubications!transactions_destination_ubication_id_fkey(name),
            users:created_by(name)
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error(`Error fetching asset ${id} from Supabase`, error);
      return undefined;
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
        assetsInRigs: 0,
        assetsUnderInspection: 0,
        assetsInProviderBase: 0,
        distributionByLocation: [],
        movementsLast30Days: [],
        alerts: []
      };
    }

    let rigsCount = 0;
    let baseProveedorCount = 0;
    let underInspectionCount = 0;
    const distributionMap: Record<string, number> = {};

    assets.forEach((a: any) => {
      const locName = a.locations?.name || "Sin Location";
      const locType = a.locations?.type;
      
      if (locType === "rig") rigsCount++;
      if (locType === "operating_base") baseProveedorCount++;
      
      if (a.status === "under_inspection") underInspectionCount++;

      distributionMap[locName] = (distributionMap[locName] || 0) + 1;
    });

    const distributionByLocation = Object.entries(distributionMap).map(([name, value]) => ({ name, value }));

    return {
      totalAssets: assets.length,
      assetsInRigs: rigsCount,
      assetsUnderInspection: underInspectionCount,
      assetsInProviderBase: baseProveedorCount,
      distributionByLocation,
      movementsLast30Days: [], // Can be calculated from transactions
      alerts: [] // Compute alerts
    };
  }

  async registerMovement(assetId: string, movement: any): Promise<void> {
    // Simplification for the example: just update the currentLocation to a specific one if possible.
    // In real scenario we would `insert` to `transactions` and `transaction_details`.
    console.log("Saving movement", movement);
  }

  async registerBulkMovement(payload: any): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error("No user authenticated");

    const destLocationId = payload.type === "transfer" 
      ? payload.destination_location_id 
      : payload.origin_location_id;

    // Fetch current ubication of the first asset since all share the same origin ubication
    const assetIds = payload.assets.map((a: any) => a.asset_id);
    const { data: firstAsset, error: caError } = await this.supabase
      .from("assets")
      .select("id, current_ubication_id")
      .eq("id", assetIds[0] || "")
      .single();

    if (caError && assetIds.length > 0) throw caError;
    const originUbicationId = firstAsset?.current_ubication_id;

    let globalDestinationUbicationId = payload.destination_ubication_id;

    if (payload.type === "transfer") {
      const { data: patioData, error: patioError } = await this.supabase
        .from("ubications")
        .select("id")
        .ilike("name", "%patio%")
        .limit(1)
        .single();
        
      if (patioError || !patioData) {
         console.error("Could not find global Patio ubication", patioError);
         throw patioError || new Error("Patio not found");
      }
      globalDestinationUbicationId = patioData.id;
    }

    // 1. Create transaction
    const { data: txData, error: txError } = await this.supabase
      .from("transactions")
      .insert({
        origin_location_id: payload.origin_location_id,
        destination_location_id: destLocationId,
        origin_ubication_id: originUbicationId,
        destination_ubication_id: globalDestinationUbicationId,
        date: new Date().toISOString(),
        type: payload.type,
        created_by: user.id,
        justification: payload.justification,
      })
      .select("id")
      .single();

    if (txError || !txData) {
      console.error("Error creating transaction", txError);
      throw txError || new Error("Transaction creation failed");
    }

    const transactionId = txData.id;

    // 2. Create transaction details
    const detailsPayload = payload.assets.map((a: any) => ({
      transaction_id: transactionId,
      asset_id: a.asset_id,
      comments: a.comments || null
    }));

    const { error: detailsError } = await this.supabase
      .from("transaction_details")
      .insert(detailsPayload);

    if (detailsError) {
      console.error("Error creating transaction details", detailsError);
      throw detailsError;
    }

    // 3. Update assets
    const { error: updateError } = await this.supabase
      .from("assets")
      .update({
         current_location_id: destLocationId,
         current_ubication_id: globalDestinationUbicationId
      })
      .in("id", assetIds);

    if (updateError) throw updateError;
    
    // 4. Upload and link certificates if it's a transfer and certs exist
    if (payload.type === "transfer" && payload.certificates && payload.certificates.length > 0) {
       const certIds = await this.uploadCertificates(payload.certificates, user.id);
       if (certIds.length > 0) {
          const links: any[] = [];
          assetIds.forEach((aId: string) => {
             certIds.forEach((cId) => {
                links.push({
                   asset_id: aId,
                   certificate_id: cId
                });
             });
          });
          const { error: linksError } = await this.supabase.from('assets_certificates').insert(links);
          if (linksError) throw linksError;
       }
    }
  }

  async registerReplacementMovement(payload: ReplacementMovementPayload): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error("No user authenticated");

    // Fetch assets to get their current ubications
    const { data: assets, error: assetsError } = await this.supabase
      .from("assets")
      .select("id, current_ubication_id")
      .in("id", [payload.asset_a_id, payload.asset_b_id]);

    if (assetsError || !assets) throw assetsError || new Error("Assets not found");

    const assetA = assets.find((a: any) => a.id === payload.asset_a_id);
    const assetB = assets.find((a: any) => a.id === payload.asset_b_id);

    if (!assetA || !assetB) throw new Error("Asset missing");

    const dateStr = new Date().toISOString();

    // Create transaction for A
    const { data: txAData, error: txAError } = await this.supabase
      .from("transactions")
      .insert({
        origin_location_id: payload.location_id,
        destination_location_id: payload.location_id,
        origin_ubication_id: assetA.current_ubication_id,
        destination_ubication_id: assetB.current_ubication_id, // A moves to B's previous ubication
        date: dateStr,
        type: payload.type,
        created_by: user.id,
        justification: payload.justification,
      })
      .select("id")
      .single();

    if (txAError || !txAData) throw txAError || new Error("Transaction A creation failed");

    // Detail for A
    const { error: detailAError } = await this.supabase
      .from("transaction_details")
      .insert({
        transaction_id: txAData.id,
        asset_id: payload.asset_a_id,
      });

    if (detailAError) throw detailAError;

    // Create transaction for B
    const { data: txBData, error: txBError } = await this.supabase
      .from("transactions")
      .insert({
        origin_location_id: payload.location_id,
        destination_location_id: payload.location_id,
        origin_ubication_id: assetB.current_ubication_id,
        destination_ubication_id: payload.asset_b_destination_ubication_id, // B moves to the new multi-asset ubication
        date: dateStr,
        type: payload.type,
        created_by: user.id,
        justification: payload.justification,
      })
      .select("id")
      .single();

    if (txBError || !txBData) throw txBError || new Error("Transaction B creation failed");

    // Detail for B
    const { error: detailBError } = await this.supabase
      .from("transaction_details")
      .insert({
        transaction_id: txBData.id,
        asset_id: payload.asset_b_id,
      });

    if (detailBError) throw detailBError;

    // Update Asset A
    const { error: updateAError } = await this.supabase
      .from("assets")
      .update({
         current_ubication_id: assetB.current_ubication_id
      })
      .eq("id", payload.asset_a_id);

    if (updateAError) throw updateAError;

    // Update Asset B
    const { error: updateBError } = await this.supabase
      .from("assets")
      .update({
         current_ubication_id: payload.asset_b_destination_ubication_id
      })
      .eq("id", payload.asset_b_id);

    if (updateBError) throw updateBError;
  }

  private async uploadCertificates(certificates: { file: File; name: string }[], userId: string): Promise<string[]> {
    const certIds: string[] = [];
    for (const cert of certificates) {
      const id = crypto.randomUUID();
      const ext = cert.file.name.split('.').pop() || '';
      const storagePath = `${id}.${ext}`;
      
      const { error: uploadError } = await this.supabase.storage
        .from('certificates')
        .upload(storagePath, cert.file);
        
      if (uploadError) throw uploadError;
      
      const { error: dbError } = await this.supabase
        .from('certificates')
        .insert({
           id,
           uploaded_by: userId,
           storage_path: storagePath,
           file_name: cert.name,
           mime_type: cert.file.type || 'application/octet-stream'
        });
        
      if (dbError) throw dbError;
      certIds.push(id);
    }
    return certIds;
  }

  async addCertificate(assetId: string, certificates: { file: File; name: string }[]): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error("No user authenticated");
    
    // Upload and get cert ids
    const certIds = await this.uploadCertificates(certificates, user.id);
    
    // Link to asset
    if (certIds.length > 0) {
      const links = certIds.map(certId => ({
        asset_id: assetId,
        certificate_id: certId
      }));
      const { error } = await this.supabase.from('assets_certificates').insert(links);
      if (error) {
         console.error("Error linking certificates to asset", error);
         throw error;
      }
    }
  }

  async registerAsset(asset: Partial<Asset>): Promise<void> {
    const rawAsset = asset as any;
    const payload = {
      brand_id: rawAsset.brand_id,
      model_id: rawAsset.model_id,
      company_id: rawAsset.company_id,
      serial_number: rawAsset.serial_number || rawAsset.serialNumber,
      status: rawAsset.status, // formData passes "active", "under_inspection", "rejected"
      function_principle_id: rawAsset.function_principle_id,
      current_location_id: rawAsset.current_location_id,
      current_ubication_id: rawAsset.current_ubication_id,
      capacity: rawAsset.capacity,
      last_inspection_code: rawAsset.last_inspection_code,
      ...Array.from({ length: 20 }, (_, i) => `property_${i + 1}`).reduce((acc: any, key) => {
        if (rawAsset[key] !== undefined && rawAsset[key] !== "") {
          acc[key] = rawAsset[key];
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
      brand_id: rawAsset.brand_id,
      model_id: rawAsset.model_id,
      serial_number: rawAsset.serial_number || rawAsset.serialNumber,
      status: rawAsset.status,
      // intentionally omit function_principle_id since it shouldn't be altered
      current_location_id: rawAsset.current_location_id,
      current_ubication_id: rawAsset.current_ubication_id,
      capacity: rawAsset.capacity,
      last_inspection_code: rawAsset.last_inspection_code,
      ...Array.from({ length: 20 }, (_, i) => `property_${i + 1}`).reduce((acc: any, key) => {
        // Here we can save empty strings to reset properties if needed, but we'll stick to updating provided keys
        if (rawAsset[key] !== undefined) {
          acc[key] = rawAsset[key];
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
        origin:locations!fk_origin_location(name),
        destination:locations!fk_destination_location(name),
        origin_ubication:ubications!transactions_origin_ubication_id_fkey(name),
        destination_ubication:ubications!transactions_destination_ubication_id_fkey(name),
        users:created_by(name),
        transaction_details (
          comments,
          assets ( id, serial_number, brands:brand_id(name), models:model_id(name) )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching movements from Supabase", error);
      return [];
    }

    return (data || []).map((row: any) => {
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
        certificates: [] // We skip certificates at the list view if there's no transactions_certificates yet
      };
    });
  }

  private async mapRowToAsset(row: any): Promise<Asset> {
    const brand = row.brands?.name || "Sin marca";
    const model = row.models?.name || "Sin modelo";
    const serialNumber = row.serial_number || "Sin SN";
    const functionalPrinciple = row.functional_principles?.name || "Componente";
    const currentLocation = row.locations?.name || "Base";
    
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
    const rawCerts = (row.assets_certificates || [])
      .map((ac: any) => ac.certificates)
      .filter((c: any) => c != null);

    const certificates: AssetCertificate[] = await Promise.all(
      rawCerts.map(async (c: any) => {
        let fileUrl = "";
        if (c.storage_path) {
          const { data } = await this.supabase.storage
            .from('certificates')
            .createSignedUrl(c.storage_path, 3600); // 1 hour expiry
          if (data?.signedUrl) {
            fileUrl = data.signedUrl;
          }
        }

        return {
          id: c.id,
          name: c.file_name || "Certificado",
          uploadDate: c.uploaded_at?.split("T")[0] || "",
          fileUrl,
        };
      })
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
      function_principle_id: row.functional_principles?.id,
      brand: brand,
      model: model,
      brand_id: row.brands?.id,
      model_id: row.models?.id,
      capacity: row.capacity,
      lastInspectionCode: row.last_inspection_code,
      serialNumber: serialNumber,
      currentLocation: currentLocation,
      current_location_id: row.locations?.id,
      position: row.ubications?.name || "N/A",
      current_ubication_id: row.ubications?.id,
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
