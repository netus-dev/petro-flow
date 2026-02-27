import { AuthCredentials, AuthResponse } from "./entities";

export interface IAuthRepository {
  login(credentials: AuthCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthResponse | null>;
}
