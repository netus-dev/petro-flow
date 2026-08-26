import { Suspense } from "react";
import { createClient } from "@/src/core/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
} from "@/src/core/presentation/components/ui/sidebar";
import { AppSidebar } from "@/src/core/presentation/components/layout/app-sidebar";
import { DashboardNavbar } from "@/src/features/dashboard/presentation/components/dashboard-navbar";
import { DashboardFooter } from "@/src/features/dashboard/presentation/components/dashboard-footer";
import { AppProvider } from "@/src/core/presentation/providers/providers";
import { AppLoader } from "@/src/core/presentation/components/ui/app-loader";
import { loadAuthorization } from "@/src/features/authorization/infrastructure/server/authorization-session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Instanciar Supabase SSR
  const supabase = await createClient();

  // 2. Obtener el usuario autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  const authorization = await loadAuthorization();
  if (authorization.status === "context_required") redirect("/select-company");

  // 3. Consultar el perfil extendido en la base de datos
  const { data: profile } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", user.id)
    .single();

    console.log(profile)

  // 4. Mapear objeto con valores por defecto (fallback)
  const userData = {
    name: profile?.name || user.email?.split("@")[0] || "Usuario",
    email: profile?.email || user.email || "",
  };

  return (
    <AppProvider>
      <SidebarProvider>
        <AppSidebar initialUser={userData} initialAuthorization={authorization.projection} />
        <SidebarInset>
          <DashboardNavbar />
          <div className="flex-1 overflow-auto min-w-0">
            <Suspense fallback={<AppLoader />}>{children}</Suspense>
          </div>
          <DashboardFooter />
        </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  );
}
