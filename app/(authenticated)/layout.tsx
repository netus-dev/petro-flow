import { Suspense } from "react";
import {
  SidebarProvider,
  SidebarInset,
} from "@/src/core/presentation/components/ui/sidebar";
import { AppSidebar } from "@/src/core/presentation/components/layout/app-sidebar";
import { DashboardNavbar } from "@/src/features/dashboard/presentation/components/dashboard-navbar";
import { DashboardFooter } from "@/src/features/dashboard/presentation/components/dashboard-footer";
import { AppProvider } from "@/src/core/presentation/providers/providers";
import { AppLoader } from "@/src/core/presentation/components/ui/app-loader";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <SidebarProvider>
        <AppSidebar />
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
