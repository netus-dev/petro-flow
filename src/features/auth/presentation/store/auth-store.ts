import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  GetProfileUseCase,
} from "../../application/uses-cases/authUsesCases";

// Dependency Injection / Singleton Pattern for Use Cases
const dataSource = new AuthDataSource();
const repository = new AuthRepositoryImpl(dataSource);

const loginUseCase = new LoginUseCase(repository);
const getProfileUseCase = new GetProfileUseCase(repository);
const registerUseCase = new RegisterUseCase(repository);
const logoutUseCase = new LogoutUseCase(repository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(repository);
const resetPasswordUseCase = new ResetPasswordUseCase(repository);
const updateUserUseCase = new UpdateUserUseCase(repository);

interface AuthState {
  user: User | null;
  profile: any;
  isLoading: boolean;
  error: string | null;

  login: (credentials: AuthCredentials) => Promise<void>;
  getProfile: () => Promise<any>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: any) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      profile: null,

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

      getProfile: async () => {
        if (!get().user) return null;

        set({ isLoading: true, error: null });
        try {
          const response = await getProfileUseCase.execute();
          if (response.error) {
            set({ error: response.error, isLoading: false });
          } else {
            set({ profile: response.data, isLoading: false });
            return response.data;
          }
        } catch (err: any) {
          set({
            error: err.message || "Error inesperado",
            isLoading: false
          });
          return null;
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
        set({ isLoading: true, error: null }); // Limpiar error al iniciar logout
        try {
          await logoutUseCase.execute();
          set({ user: null, profile: null, isLoading: false, error: null }); // Limpiar todo al salir
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
    }),
    {
      name: "auth-storage", // llave bajo la cual se guardará en localStorage
    }
  )
);
