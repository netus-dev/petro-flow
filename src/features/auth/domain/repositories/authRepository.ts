import {
  AuthCredentials,
  AuthResponse,
  RegisterCredentials,
} from "../entities/authEntities";

export interface IAuthRepository {
  login(credentials: AuthCredentials): Promise<AuthResponse>;
  register(credentials: RegisterCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthResponse | null>;
  resetPassword(email: string): Promise<void>;
  updateUser(data: any): Promise<void>;
}
