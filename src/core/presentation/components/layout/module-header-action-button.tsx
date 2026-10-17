"use client";

import { forwardRef, type ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/src/core/presentation/components/ui/button";
import { cn } from "@/src/core/utils/utils";

export type ModuleHeaderActionButtonLevel = "primary" | "secondary" | "accent";

const levelClassNames: Record<ModuleHeaderActionButtonLevel, string> = {
  primary: "",
  secondary: "",
  accent: "bg-accent text-accent-foreground hover:bg-accent/80",
};

const levelVariants: Record<ModuleHeaderActionButtonLevel, ComponentProps<typeof Button>["variant"]> = {
  primary: "default",
  secondary: "outline",
  accent: "secondary",
};

interface ModuleHeaderActionButtonProps extends Omit<ComponentProps<typeof Button>, "aria-label" | "children" | "size" | "variant"> {
  icon: LucideIcon;
  label: string;
  level?: ModuleHeaderActionButtonLevel;
}

/**
 * Icon-only action button standardized for ModuleHeader action slots.
 *
 * @param icon - Lucide icon rendered inside the button.
 * @param label - Accessible label applied to the icon-only button.
 * @param level - Visual hierarchy for the action within the module header.
 */
export const ModuleHeaderActionButton = forwardRef<HTMLButtonElement, ModuleHeaderActionButtonProps>(
  function ModuleHeaderActionButton(
    {
      icon: Icon,
      label,
      level = "primary",
      className,
      ...props
    },
    ref,
  ) {
    return (
      <Button
        {...props}
        ref={ref}
        aria-label={label}
        className={cn(levelClassNames[level], className)}
        size="icon-sm"
        variant={levelVariants[level]}
      >
        <Icon className="size-4" aria-hidden="true" />
      </Button>
    );
  },
);
