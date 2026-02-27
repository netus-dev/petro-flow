import { AuthCredentials, AuthResponse } from "../domain/entities";
import { IAuthRepository } from "../domain/repository";

export class LoginUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(credentials: AuthCredentials): Promise<AuthResponse> {
    if (!credentials.email || !credentials.password) {
      throw new Error("Email y contrasena son requeridos");
    }
    return this.repository.login(credentials);
  }
}
