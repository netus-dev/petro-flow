import { createClient } from "@/src/core/lib/supabase/client";
import {
  AuthCredentials,
  RegisterCredentials,
} from "../../domain/entities/authEntities";

export class AuthDataSource {
  private supabase = createClient();

  async signUp(credentials: RegisterCredentials) {
    const { data, error } = await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password!,
      options: {
        data: {
          full_name: credentials.name,
        },
      },
    });
    return { data, error };
  }

  async signIn(credentials: AuthCredentials) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password!,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentSession() {
    const { data, error } = await this.supabase.auth.getSession();
    return { data, error };
  }

  async resetPassword(email: string, redirectTo?: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    );
    return { data, error };
  }

  async updateUser(data: any) {
    const { data: userData, error } = await this.supabase.auth.updateUser(data);
    return { data: userData, error };
  }

  async getProfile() {
    // 1. Obtener el ID del usuario actual de la sesión de Supabase
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError || !user) {
      console.error("No se pudo obtener el usuario de la sesión");
      return { data: null, error: authError };
    }

    // 2. Llamar a la función pasando el nombre de parámetro idéntico al SQL
    const { data, error } = await this.supabase.rpc("get_user_profile", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error en RPC:", error.message, error.details);
    }

    return { data, error };
  }
}
