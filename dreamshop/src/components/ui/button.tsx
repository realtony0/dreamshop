"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        size === "sm" && "px-4 py-1.5 text-xs",
        size === "lg" && "px-6 py-3 text-base",
        variant === "primary" &&
          "border-border bg-fg text-bg hover:bg-fg/90 active:bg-fg/80",
        variant === "outline" &&
          "border-border bg-transparent text-fg hover:bg-muted active:bg-muted/70",
        variant === "ghost" &&
          "border-transparent bg-transparent text-fg hover:bg-muted active:bg-muted/70",
        className
      )}
      {...props}
    />
  );
}

