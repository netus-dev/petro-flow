"use client";

import Image from "next/image";
import { PetroLogo } from "@/src/core/presentation/components/ui/petro-logo";
import { LoginForm } from "./login-form";
import { LoginStats } from "./login-stats";
import { Shield } from "lucide-react";

export function LoginContent() {
  return (
    <main className="relative flex min-h-screen">
      {/* Left Panel — Hero Image */}
      <section
        className="relative hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col justify-between overflow-hidden"
        aria-hidden="true"
      >
        {/* Background image */}
        <Image
          src="/images/oil-rig-hero.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-background/70" />

        {/* Accent line */}
        <div className="absolute left-0 top-0 h-full w-1 bg-primary/60" />

        {/* Top content */}
        <div className="relative z-10 p-10">
          <PetroLogo />
        </div>

        {/* Center content */}
        <div className="absolute inset-0 z-10 flex items-center px-10">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary">
              Control Integral
            </p>
            <h1 className="text-4xl font-bold leading-tight text-foreground font-mono text-balance xl:text-5xl">
              La plataforma que impulsa tus operaciones petroleras
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Gestiona de forma centralizada los procesos administrativos,
              y la operación diaria de tu organización.
            </p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 p-10 pt-0">
          <LoginStats />
        </div>
      </section>

      {/* Right Panel — Login Form */}
      <section className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[45%] xl:w-[40%]">
        <div className="w-full max-w-sm flex flex-col gap-10">
          {/* Mobile logo */}
          <div className="lg:hidden">
            <PetroLogo />
          </div>

          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-foreground font-mono">
              Acceso a plataforma
            </h2>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales corporativas para continuar
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
              Acceso seguro
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-4">
            <div className="flex items-center justify-center size-8 rounded-md bg-primary/10">
              <Shield className="size-4 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">
                Conexion cifrada de extremo a extremo
              </span>
              <span className="text-[10px] text-muted-foreground">
                Protocolo TLS 1.3 — Certificado verificado
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-muted-foreground">
            {"2026 PetroFlow Energy Platform. Todos los derechos reservados."}
          </p>
        </div>
      </section>
    </main>
  );
}
