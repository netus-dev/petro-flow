"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import { Button } from "@/src/core/presentation/components/ui/button";

import { useAuth } from "../hooks/use-auth";

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-muted-foreground text-xs tracking-widest uppercase"
        >
          Correo corporativo
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="usuario@petroflow.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 rounded-lg text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-muted-foreground text-xs tracking-widest uppercase"
          >
            Contrasena
          </Label>
          <button
            type="button"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Recuperar acceso
          </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 rounded-lg text-sm pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={
              showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm tracking-wide transition-all duration-300 group"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Verificando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Iniciar Sesion
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </Button>
    </form>
  );
}
