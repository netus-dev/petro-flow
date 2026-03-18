import { Profile, ProfileEntity, Company, Role } from '../../domain/entities/profileEntity';

export class ProfileEntityModel implements ProfileEntity {
  constructor(
    public roles: Role[],
    public company: Company,
    public profile: Profile,
    public permissions: any[]
  ) {}

  static fromJson(json: any): ProfileEntityModel | null {
    if (!json) return null;
    
    // 1. Manejar si el resultado viene en un array de 1 elemento (común en RPCs de Supabase)
    const rawData = Array.isArray(json) ? json[0] : json;
    if (!rawData) return null;

    // 2. Manejar si el RPC devuelve el JSON anidado dentro del nombre de la función (ej: get_user_profile)
    // p.ej. { "get_user_profile": { "roles": [...], ... } }
    const data = rawData.get_user_profile || rawData;

    return new ProfileEntityModel(
      Array.isArray(data.roles) ? data.roles.map((r: any) => RoleModel.fromJson(r)) : [],
      data.company ? CompanyModel.fromJson(data.company) : (null as any),
      data.profile ? ProfileModel.fromJson(data.profile) : (null as any),
      data.permissions || []
    );
  }

  toJson(): string {
    return JSON.stringify({
      roles: this.roles,
      company: this.company,
      profile: this.profile,
      permissions: this.permissions
    });
  }
}

export class CompanyModel implements Company {
  constructor(
    public id: string,
    public name: string,
    public created_at: Date,
    public description: string
  ) {}

  static fromJson(json: any): CompanyModel {
    return new CompanyModel(
      json.id,
      json.name,
      new Date(json.created_at),
      json.description
    );
  }
}

export class RoleModel implements Role {
  constructor(
    public id: string,
    public name: string
  ) {}

  static fromJson(json: any): RoleModel {
    return new RoleModel(json.id, json.name);
  }
}

export class ProfileModel implements Profile {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public phone: string,
    public image_url: any,
    public is_active: boolean,
    public created_at: Date,
    public job_position: string
  ) {}

  static fromJson(json: any): ProfileModel {
    return new ProfileModel(
      json.id,
      json.name,
      json.email,
      json.phone,
      json.image_url,
      json.is_active,
      new Date(json.created_at),
      json.job_position
    );
  }

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      image_url: this.image_url,
      is_active: this.is_active,
      created_at: this.created_at.toISOString(),
      job_position: this.job_position
    });
  }
}
