"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Route,
  Clock,
  GraduationCap,
  Gauge,
  CalendarRange,
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { PetroLogo } from "@/src/core/presentation/components/ui/petro-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/src/core/presentation/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/core/presentation/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@/src/core/presentation/components/ui/avatar";
import { useApp } from "@/src/core/presentation/providers/providers";
import { useAuth } from "@/src/features/auth/presentation/hooks/use-auth";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useApp();
  const { logout } = useAuth();

  const mainModules = [
    {
      titleKey: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      titleKey: "sidebar.traceability",
      label: t("sidebar.traceability"),
      icon: Route,
      href: "/dashboard/trazabilidad",
    },
    {
      titleKey: "sidebar.timesheet",
      label: t("sidebar.timesheet"),
      icon: Clock,
      href: "/dashboard/timesheet",
    },
    {
      titleKey: "sidebar.elearning",
      label: t("sidebar.elearning"),
      icon: GraduationCap,
      href: "/dashboard/e-learning",
    },
    {
      titleKey: "sidebar.hourMeters",
      label: t("sidebar.hourMeters"),
      icon: Gauge,
      href: "/dashboard/hour-meters",
    },
    {
      titleKey: "sidebar.lookahead",
      label: t("sidebar.lookahead"),
      icon: CalendarRange,
      href: "/dashboard/look-a-head",
    },
  ];

  const secondaryItems = [
    {
      titleKey: "sidebar.settings",
      label: t("sidebar.settings"),
      icon: Settings,
      href: "/dashboard/settings",
    },
    {
      titleKey: "sidebar.support",
      label: t("sidebar.support"),
      icon: HelpCircle,
      href: "/dashboard/soporte",
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header */}
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <PetroLogo iconClassName="size-9" />
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            {t("sidebar.modules")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainModules.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                          : ""
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            {t("sidebar.system")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      CM
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-semibold text-sidebar-foreground truncate">
                      Carlos Mendez
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {t("sidebar.operator")}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-card border-border"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="size-9 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      CM
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      Carlos Mendez
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      carlos.mendez@petroflow.com
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-sm text-foreground">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 size-4" />
                    {t("sidebar.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-sm text-foreground">
                  <Link href="/dashboard/soporte">
                    <HelpCircle className="mr-2 size-4" />
                    {t("sidebar.support")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-sm text-destructive">
                  <Link href="/" onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    {t("sidebar.logout")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
