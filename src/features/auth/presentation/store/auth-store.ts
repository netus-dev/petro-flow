import { create } from "zustand";
import {
  User,
  AuthCredentials,
  RegisterCredentials,
} from "../../domain/entities/authEntities";
import { AuthDataSource } from "../../infrastructure/datasources/authDatasource";
import { AuthRepositoryImpl } from "../../infrastructure/repositories/authRepositoryImpl";
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
  ResetPasswordUseCase,
  UpdateUserUseCase,
} from "../../application/uses-cases/authUsesCases";

// Dependency Injection / Singleton Pattern for Use Cases
const dataSource = new AuthDataSource();
const repository = new AuthRepositoryImpl(dataSource);

const loginUseCase = new LoginUseCase(repository);
const registerUseCase = new RegisterUseCase(repository);
const logoutUseCase = new LogoutUseCase(repository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(repository);
const resetPasswordUseCase = new ResetPasswordUseCase(repository);
const updateUserUseCase = new UpdateUserUseCase(repository);

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: any) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginUseCase.execute(credentials);
      if (response.error) {
        set({ error: response.error, isLoading: false });
      } else {
        set({ user: response.user, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await registerUseCase.execute(credentials);
      if (response.error) {
        set({ error: response.error, isLoading: false });
      } else {
        set({ user: response.user, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUseCase.execute();
      set({ user: null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const response = await getCurrentUserUseCase.execute();
      set({ user: response?.user || null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await resetPasswordUseCase.execute(email);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await updateUserUseCase.execute(data);
      // Re-fetch user to update state
      const response = await getCurrentUserUseCase.execute();
      set({ user: response?.user || null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
