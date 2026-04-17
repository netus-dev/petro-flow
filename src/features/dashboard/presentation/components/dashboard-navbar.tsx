"use client"

import Link from "next/link"
import { Bell, Search, Maximize2, Sun, Moon, Languages } from "lucide-react"
import { SidebarTrigger } from "@/src/core/presentation/components/ui/sidebar"
import { Badge } from "@/src/core/presentation/components/ui/badge"
import { Button } from "@/src/core/presentation/components/ui/button"
import { Input } from "@/src/core/presentation/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/core/presentation/components/ui/dropdown-menu"
import { useApp } from "@/src/core/presentation/providers/providers"
import { ThemeToggle } from "@/src/core/presentation/components/ui/ThemeToggle"

export function DashboardNavbar() {
  const { theme, toggleTheme, locale, setLocale, t } = useApp()

  const notifications = [
    {
      id: 1,
      title: t("notif.pressure_alert"),
      description: t("notif.pressure_desc"),
      time: t("notif.5min"),
      unread: true,
    },
    {
      id: 2,
      title: t("notif.report_done"),
      description: t("notif.report_desc"),
      time: t("notif.1hr"),
      unread: true,
    },
    {
      id: 3,
      title: t("notif.maintenance"),
      description: t("notif.maintenance_desc"),
      time: t("notif.3hr"),
      unread: false,
    },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      {/* Separator */}
      <div className="h-5 w-px bg-border" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={t("nav.search")}
          className="h-9 pl-9 bg-secondary/50 border-border text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Live indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
            {t("nav.system_active")}
          </span>
        </div>

        {/* Separator */}
        <div className="hidden lg:block h-5 w-px bg-border mx-1" />

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-muted-foreground hover:text-foreground"
              aria-label="Language"
            >
              <Languages className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-36 bg-card border-border"
          >
            <DropdownMenuItem
              onClick={() => setLocale("es")}
              className={`text-xs gap-2 ${locale === "es" ? "text-primary font-semibold" : "text-foreground"}`}
            >
              <span className="text-base leading-none">{'🇪🇸'}</span>
              Espanol
              {locale === "es" && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLocale("en")}
              className={`text-xs gap-2 ${locale === "en" ? "text-primary font-semibold" : "text-foreground"}`}
            >
              <span className="text-base leading-none">{'🇺🇸'}</span>
              English
              {locale === "en" && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Fullscreen */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-muted-foreground hover:text-foreground"
          aria-label={t("nav.fullscreen")}
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen()
            } else {
              document.exitFullscreen()
            }
          }}
        >
          <Maximize2 className="size-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9 text-muted-foreground hover:text-foreground"
              aria-label={t("nav.notifications")}
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 size-4 items-center justify-center rounded-full p-0 text-[9px]">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-card border-border p-0"
          >
            <div className="flex items-center justify-between border-b border-border p-3">
              <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
                {t("nav.notifications")}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {unreadCount} {t("nav.new")}
              </Badge>
            </div>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-secondary/50"
              >
                <div className="flex items-center gap-2 w-full">
                  {notification.unread && (
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  )}
                  <span
                    className={`text-xs font-medium ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {notification.title}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                    {notification.time}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground pl-3.5">
                  {notification.description}
                </span>
              </DropdownMenuItem>
            ))}
            <div className="border-t border-border p-2">
              <Link
                href="/dashboard/notificaciones"
                className="block w-full text-center text-[11px] font-medium text-primary hover:text-primary/80 py-1 transition-colors"
              >
                {t("nav.view_all")}
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
