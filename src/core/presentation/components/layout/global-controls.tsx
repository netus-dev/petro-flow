"use client";

import Link from "next/link";
import { Bell, Languages, Maximize2 } from "lucide-react";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { Button } from "@/src/core/presentation/components/ui/button";
import { SidebarTrigger } from "@/src/core/presentation/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/core/presentation/components/ui/dropdown-menu";
import { ThemeToggle } from "@/src/core/presentation/components/ui/ThemeToggle";
import { useApp } from "@/src/core/presentation/providers/providers";

export function GlobalControls() {
  const { locale, setLocale, t } = useApp();

  const notifications = [
    { id: 1, title: t("notif.pressure_alert"), description: t("notif.pressure_desc"), time: t("notif.5min"), unread: true },
    { id: 2, title: t("notif.report_done"), description: t("notif.report_desc"), time: t("notif.1hr"), unread: true },
    { id: 3, title: t("notif.maintenance"), description: t("notif.maintenance_desc"), time: t("notif.3hr"), unread: false },
  ];
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const controlClassName = "size-9 text-muted-foreground hover:text-foreground";

  return (
    <div className="flex items-center justify-between gap-1 group-data-[collapsible=icon]:flex-col">
      <SidebarTrigger className={controlClassName} aria-label="Toggle sidebar" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={controlClassName} aria-label="Language">
            <Languages className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-36 bg-card border-border">
          <DropdownMenuItem onClick={() => setLocale("es")} className={`text-xs gap-2 ${locale === "es" ? "text-primary font-semibold" : "text-foreground"}`}>
            <span className="text-base leading-none">🇪🇸</span> Espanol
            {locale === "es" && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocale("en")} className={`text-xs gap-2 ${locale === "en" ? "text-primary font-semibold" : "text-foreground"}`}>
            <span className="text-base leading-none">🇺🇸</span> English
            {locale === "en" && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeToggle />

      <Button
        variant="ghost"
        size="icon"
        className={controlClassName}
        aria-label={t("nav.fullscreen")}
        onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}
      >
        <Maximize2 className="size-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={`relative ${controlClassName}`} aria-label={t("nav.notifications")}>
            <Bell className="size-4" />
            {unreadCount > 0 && <Badge className="absolute -top-0.5 -right-0.5 size-4 items-center justify-center rounded-full p-0 text-[9px]">{unreadCount}</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-80 bg-card border-border p-0">
          <div className="flex items-center justify-between border-b border-border p-3">
            <span className="text-xs font-semibold text-foreground tracking-wide uppercase">{t("nav.notifications")}</span>
            <Badge variant="secondary" className="text-[10px]">{unreadCount} {t("nav.new")}</Badge>
          </div>
          {notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-secondary/50">
              <div className="flex items-center gap-2 w-full">
                {notification.unread && <span className="size-1.5 rounded-full bg-primary shrink-0" />}
                <span className={`text-xs font-medium ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}>{notification.title}</span>
                <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{notification.time}</span>
              </div>
              <span className="text-[11px] text-muted-foreground pl-3.5">{notification.description}</span>
            </DropdownMenuItem>
          ))}
          <div className="border-t border-border p-2">
            <Link href="/notificaciones" className="block w-full text-center text-[11px] font-medium text-primary hover:text-primary/80 py-1 transition-colors">{t("nav.view_all")}</Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
