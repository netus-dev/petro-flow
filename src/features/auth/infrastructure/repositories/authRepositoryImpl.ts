import {
  AuthCredentials,
  AuthResponse,
  RegisterCredentials,
  User,
} from "../../domain/entities/authEntities";
import { IAuthRepository } from "../../domain/repositories/authRepository";
import { AuthDataSource } from "../datasources/authDatasource";

export class AuthRepositoryImpl implements IAuthRepository {
  private dataSource: AuthDataSource;

  constructor(dataSource: AuthDataSource) {
    this.dataSource = dataSource;
  }

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const { data, error } = await this.dataSource.signIn(credentials);

    if (error) {
      return { user: null, error: error.message };
    }

    const user: User = {
      id: data.user?.id || "",
      email: data.user?.email,
      name: data.user?.user_metadata?.full_name,
    };

    return { user, session: data.session };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data, error } = await this.dataSource.signUp(credentials);

    if (error) {
      return { user: null, error: error.message };
    }

    const user: User = {
      id: data.user?.id || "",
      email: data.user?.email,
      name: data.user?.user_metadata?.full_name,
    };

    return { user, session: data.session };
  }

  async logout(): Promise<void> {
    const { error } = await this.dataSource.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<AuthResponse | null> {
    const { data, error } = await this.dataSource.getCurrentSession();

    if (error || !data.session) {
      return null;
    }

    const user: User = {
      id: data.session.user.id,
      email: data.session.user.email,
      name: data.session.user.user_metadata?.full_name,
    };

    return { user, session: data.session };
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.dataSource.resetPassword(email);
    if (error) throw error;
  }

  async updateUser(data: any): Promise<void> {
    const { error } = await this.dataSource.updateUser(data);
    if (error) throw error;
  }
}
