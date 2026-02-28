import {
  AuthCredentials,
  AuthResponse,
  RegisterCredentials,
} from "../../domain/entities/authEntities";
import { IAuthRepository } from "../../domain/repositories/authRepository";

export class LoginUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(credentials: AuthCredentials): Promise<AuthResponse> {
    if (!credentials.email || !credentials.password) {
      throw new Error("Email y contraseña son requeridos");
    }
    return this.repository.login(credentials);
  }
}

export class RegisterUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (!credentials.email || !credentials.password || !credentials.name) {
      throw new Error("Todos los campos son requeridos");
    }
    return this.repository.register(credentials);
  }
}

export class LogoutUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(): Promise<void> {
    return this.repository.logout();
  }
}

export class GetCurrentUserUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(): Promise<AuthResponse | null> {
    return this.repository.getCurrentUser();
  }
}

export class ResetPasswordUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email) throw new Error("Email es requerido");
    return this.repository.resetPassword(email);
  }
}

export class UpdateUserUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(data: any): Promise<void> {
    return this.repository.updateUser(data);
  }
}

export class GetProfileUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(): Promise<any> {
    return this.repository.getProfile();
  }
}
