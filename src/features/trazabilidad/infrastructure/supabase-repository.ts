import { createClient } from "@/src/core/lib/supabase/client";
import { Asset, TrazabilidadStats, AssetCertificate, JourneyStop } from "../domain/entities";
import { ITrazabilidadRepository } from "../domain/repository";

export class SupabaseTrazabilidadRepository implements ITrazabilidadRepository {
  private supabase = createClient();

  private mapAssetStatus(rawStatus: string): "Operativo" | "En mantenimiento" | "En tránsito" {
    switch (rawStatus) {
      case 'active': return "Operativo";
      case 'under_inspection': return "En mantenimiento";
      case 'rejected': return "En mantenimiento";
      default: return "Operativo";
    }
  }

  async getAssetList(): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from("assets")
      .select(`
        *,
        brands:brand_id ( * ),
        models:model_id ( * ),
        functional_principles:function_principle_id ( * ),
        locations:current_location_id ( * ),
        ubications:current_ubication_id ( * ),
        certificates ( id, certificate_url, created_at ),
        transaction_details (
          comments,
          transactions (
            id, type, date, justification, origin_location_id, destination_location_id,
            origin:locations!fk_origin_location(name),
            destination:locations!fk_destination_location(name),
            users:created_by(name)
          )
        )
      `);

    if (error) {
      console.error("Error fetching assets from Supabase", error);
      return [];
    }

    return (data || []).map((row: any) => this.mapRowToAsset(row));
  }

  async getAssetById(id: string): Promise<Asset | undefined> {
    const { data, error } = await this.supabase
      .from("assets")
      .select(`
        *,
        brands:brand_id ( name ),
        models:model_id ( name ),
        functional_principles:function_principle_id ( * ),
        locations:current_location_id ( name ),
        ubications:current_ubication_id ( name ),
        certificates ( id, certificate_url, created_at ),
        transaction_details (
          comments,
          transactions (
            id, type, date, justification, origin_location_id, destination_location_id,
            origin:locations!fk_origin_location(name),
            destination:locations!fk_destination_location(name),
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

    return this.mapRowToAsset(data);
  }

  async getDashboardStats(): Promise<TrazabilidadStats> {
    // For now, doing simple stats by pulling all basic assets
    // A better approach in production is using RPCs or aggregates, but this works for standard MVPs.
    const { data: assets, error } = await this.supabase
      .from("assets")
      .select(`
        id, status, serial_number,
        locations:current_location_id ( name )
      `)
      .neq("is_active", false);

    if (error || !assets) {
      return {
        totalAssets: 0,
        assetsInRig702: 0,
        assetsInRig703: 0,
        assetsInTransit: 0,
        assetsInProviderBase: 0,
        distributionByLocation: [],
        movementsLast30Days: [],
        alerts: []
      };
    }

    let rig702Count = 0;
    let rig703Count = 0;
    let baseProveedorCount = 0;
    let inTransitCount = 0;
    const distributionMap: Record<string, number> = {};

    assets.forEach((a: any) => {
      const locName = a.locations?.name || "Sin Location";
      if (locName.includes("702")) rig702Count++;
      if (locName.includes("703")) rig703Count++;
      if (locName.toLowerCase().includes("proveedor")) baseProveedorCount++;
      
      const st = this.mapAssetStatus(a.status);
      if (st === "En tránsito") inTransitCount++;

      distributionMap[locName] = (distributionMap[locName] || 0) + 1;
    });

    const distributionByLocation = Object.entries(distributionMap).map(([name, value]) => ({ name, value }));

    return {
      totalAssets: assets.length,
      assetsInRig702: rig702Count,
      assetsInRig703: rig703Count,
      assetsInTransit: inTransitCount,
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

    // 1. Create transaction
    const { data: txData, error: txError } = await this.supabase
      .from("transactions")
      .insert({
        origin_location_id: payload.origin_location_id,
        destination_location_id: destLocationId,
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
    const assetIds = payload.assets.map((a: any) => a.asset_id);

    if (payload.type === "transfer") {
      // Find the global "Patio" ubication
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

      const { error: updateError } = await this.supabase
        .from("assets")
        .update({
           current_location_id: payload.destination_location_id,
           current_ubication_id: patioData.id
        })
        .in("id", assetIds);

      if (updateError) throw updateError;
    } else if (payload.type === "reubication") {
      const { error: updateError } = await this.supabase
        .from("assets")
        .update({
           current_ubication_id: payload.destination_ubication_id
        })
        .in("id", assetIds);

      if (updateError) throw updateError;
    }
  }

  async addCertificate(assetId: string, certificate: Partial<any>): Promise<void> {
    // Insert into certificates table
    const { error } = await this.supabase
      .from('certificates')
      .insert({
        asset_id: assetId,
        certificate_url: certificate.fileUrl || ''
      });
      
    if (error) console.error("Error adding certificate", error);
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

  private mapRowToAsset(row: any): Asset {
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
    
    // Map certificates
    const certificates: AssetCertificate[] = (row.certificates || []).map((c: any) => ({
      id: c.id,
      name: "Certificado de Inspección", // we could deduce from url
      uploadDate: c.created_at?.split("T")[0] || "",
      fileUrl: c.certificate_url,
    }));

    // Map journey stops from transaction_details
    const journey: JourneyStop[] = (row.transaction_details || []).map((td: any) => {
      const tx = td.transactions || {};
      const oName = tx.origin?.name || "Origen";
      const dName = tx.destination?.name || "Destino";
      return {
        id: tx.id || Date.now().toString(),
        provider: dName,
        location: dName,
        service: tx.type === 'transfer' ? "Traslado" : "Reubicación",
        dateIn: tx.date ? tx.date.split("T")[0] : "",
        dateOut: null,
        status: "completed",
        notes: td.comments || tx.justification || "",
        responsible: tx.users?.[0]?.name || "Sistema" // Quick patch for responsible
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
      properties,
      journey,
      certificates
    };
  }
}
