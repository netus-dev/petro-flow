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
        id, brand, model, serial_number, status, updated_at,
        functional_principles:function_principle_id ( name ),
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
        id, brand, model, serial_number, status, updated_at,
        functional_principles:function_principle_id ( name ),
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
      `);

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
    // Basic insert structure
    console.log("Registering asset", asset);
  }

  private mapRowToAsset(row: any): Asset {
    const brand = row.brand || "Sin marca";
    const model = row.model || "Sin modelo";
    const serialNumber = row.serial_number || "Sin SN";
    const functionalPrinciple = row.functional_principles?.name || "Componente";
    const currentLocation = row.locations?.name || "Base";
    
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
      brand: brand,
      model: model,
      serialNumber: serialNumber,
      currentLocation: currentLocation,
      position: row.ubications?.name || "N/A",
      status: this.mapAssetStatus(row.status),
      lastMovementDate: row.updated_at ? row.updated_at.split("T")[0] : "N/A",
      name: `${brand} ${model}`,
      type: functionalPrinciple,
      journey,
      certificates
    };
  }
}
