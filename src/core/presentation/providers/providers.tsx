"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"

type Theme = "dark" | "light"
type Locale = "es" | "en"

interface AppContextType {
  theme: Theme
  toggleTheme: () => void
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const translations: Record<Locale, Record<string, string>> = {
  es: {
    "nav.search": "Buscar modulos, reportes, pozos...",
    "nav.system_active": "Sistema Activo",
    "nav.notifications": "Notificaciones",
    "nav.new": "nuevas",
    "nav.view_all": "Ver todas las notificaciones",
    "nav.fullscreen": "Pantalla completa",
    "sidebar.platform": "Plataforma Petrolera",
    "sidebar.modules": "Modulos",
    "sidebar.system": "Sistema",
    "sidebar.traceability": "Trazabilidad",
    "sidebar.timesheet": "Timesheet",
    "sidebar.elearning": "E-Learning",
    "sidebar.orometers": "Orometers Dashboard",
    "sidebar.lookahead": "Look-a-Head",
    "sidebar.settings": "Configuracion",
    "sidebar.support": "Soporte",
    "sidebar.logout": "Cerrar Sesion",
    "sidebar.operator": "Operador Senior",
    "footer.rights": "Todos los derechos reservados.",
    "footer.last_sync": "Ultima sync:",
    "dashboard.welcome": "Bienvenido de nuevo",
    "dashboard.summary": "Resumen general de tus operaciones y modulos del sistema.",
    "dashboard.modules": "Modulos del Sistema",
    "dashboard.activity": "Actividad Reciente",
    "theme.dark": "Oscuro",
    "theme.light": "Claro",
    "lang.es": "ES",
    "lang.en": "EN",
    "notif.pressure_alert": "Alerta de presion",
    "notif.pressure_desc": "Pozo PF-042 supero el umbral de 3,500 PSI",
    "notif.report_done": "Reporte completado",
    "notif.report_desc": "El reporte diario de produccion esta disponible",
    "notif.maintenance": "Mantenimiento programado",
    "notif.maintenance_desc": "Plataforma Norte — 28 Feb 2026",
    "notif.5min": "Hace 5 min",
    "notif.1hr": "Hace 1 hora",
    "notif.3hr": "Hace 3 horas",
  },
  en: {
    "nav.search": "Search modules, reports, wells...",
    "nav.system_active": "System Active",
    "nav.notifications": "Notifications",
    "nav.new": "new",
    "nav.view_all": "View all notifications",
    "nav.fullscreen": "Fullscreen",
    "sidebar.platform": "Oil Platform",
    "sidebar.modules": "Modules",
    "sidebar.system": "System",
    "sidebar.traceability": "Traceability",
    "sidebar.timesheet": "Timesheet",
    "sidebar.elearning": "E-Learning",
    "sidebar.orometers": "Orometers Dashboard",
    "sidebar.lookahead": "Look-a-Head",
    "sidebar.settings": "Settings",
    "sidebar.support": "Support",
    "sidebar.logout": "Log Out",
    "sidebar.operator": "Senior Operator",
    "footer.rights": "All rights reserved.",
    "footer.last_sync": "Last sync:",
    "dashboard.welcome": "Welcome back",
    "dashboard.summary": "General overview of your operations and system modules.",
    "dashboard.modules": "System Modules",
    "dashboard.activity": "Recent Activity",
    "theme.dark": "Dark",
    "theme.light": "Light",
    "lang.es": "ES",
    "lang.en": "EN",
    "notif.pressure_alert": "Pressure Alert",
    "notif.pressure_desc": "Well PF-042 exceeded 3,500 PSI threshold",
    "notif.report_done": "Report Completed",
    "notif.report_desc": "The daily production report is available",
    "notif.maintenance": "Scheduled Maintenance",
    "notif.maintenance_desc": "North Platform — Feb 28, 2026",
    "notif.5min": "5 min ago",
    "notif.1hr": "1 hour ago",
    "notif.3hr": "3 hours ago",
  },
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [locale, setLocale] = useState<Locale>("es")

  useEffect(() => {
    const root = document.documentElement
    if (theme === "light") {
      root.classList.add("light")
    } else {
      root.classList.remove("light")
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"))

  const t = (key: string) => translations[locale]?.[key] ?? key

  return (
    <AppContext.Provider value={{ theme, toggleTheme, locale, setLocale, t }}>
      {children}
    </AppContext.Provider>
  )
}
