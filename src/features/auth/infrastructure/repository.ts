import { AuthCredentials, AuthResponse, User } from "../domain/entities";
import { IAuthRepository } from "../domain/repository";

export class MockAuthRepository implements IAuthRepository {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple mock validation
    if (credentials.email.includes("error")) {
      throw new Error("Credenciales invalidas");
    }

    const mockUser: User = {
      id: "usr-001",
      email: credentials.email,
      name: "Usuario Demo",
      role: "admin",
    };

    return {
      user: mockUser,
      token: "mock-jwt-token-lib",
    };
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async getCurrentUser(): Promise<AuthResponse | null> {
    return null;
  }
}
