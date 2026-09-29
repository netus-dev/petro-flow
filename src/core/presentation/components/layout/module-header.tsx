"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/src/core/utils/utils";

export interface ModuleHeaderNavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface ModuleHeaderProps {
  title: string;
  icon: LucideIcon;
  navigation?: readonly ModuleHeaderNavigationItem[];
  actions?: ReactNode;
}

function isNavigationItemActive(pathname: string, href: string, exact = false) {
  return pathname === href || (!exact && pathname.startsWith(`${href}/`));
}

/** Shared three-zone header for authenticated modules. */
export function ModuleHeader({ title, icon: Icon, navigation = [], actions }: ModuleHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex flex-col gap-3 border-b border-border/60 px-6 py-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
      <div className="flex min-w-0 items-center gap-3 md:justify-self-start">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
          <Icon className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h1 className="truncate text-lg font-bold tracking-tight text-foreground font-mono md:text-xl">{title}</h1>
      </div>

      {navigation.length > 0 && <nav aria-label={`${title} navigation`} className="flex w-fit max-w-full min-w-0 items-center gap-1 self-center overflow-x-auto rounded-lg border border-border bg-secondary/20 p-1 md:justify-self-center">
        {navigation.map(({ href, label, icon: NavigationIcon, exact }) => {
          const active = isNavigationItemActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <NavigationIcon className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>}

      <div className="flex min-w-0 justify-end gap-2 md:justify-self-end">{actions}</div>
    </header>
  );
}

export { isNavigationItemActive };
