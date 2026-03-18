"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";
import { AuthCredentials } from "../../domain/entities/authEntities";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    profile,
    isLoading,
    error,
    login: storeLogin,
    getProfile: storeGetProfile,
    logout: storeLogout,
    checkSession,
    clearError,
  } = useAuthStore();

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      await storeLogin(credentials);
      // We check if there's no error after login attempt
      // The store updates both 'user' and 'error'
    },
    [storeLogin],
  );

  const getProfile = useCallback(async () => {
    return await storeGetProfile();
  }, [storeGetProfile]);

  const logout = useCallback(async () => {
    await storeLogout();
    router.push("/auth/login");
  }, [storeLogout, router]);

  return {
    user,
    profile,
    login,
    getProfile,
    logout,
    checkSession,
    isLoading,
    error,
    clearError,
  };
}
