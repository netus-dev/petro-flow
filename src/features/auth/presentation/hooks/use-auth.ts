"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MockAuthRepository } from "../../infrastructure/repository";
import { LoginUseCase } from "../../application/use-cases";
import { AuthCredentials } from "../../domain/entities";

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new MockAuthRepository(), []);
  const loginUseCase = useMemo(
    () => new LoginUseCase(repository),
    [repository],
  );

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        await loginUseCase.execute(credentials);
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Error al iniciar sesion");
      } finally {
        setIsLoading(false);
      }
    },
    [loginUseCase, router],
  );

  return {
    login,
    isLoading,
    error,
  };
}
