"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { defaultTheme, isThemeId, themes, type ThemeId } from "@/lib/themes";

const storageKey = "ds_theme_v3";
const explicitKey = "ds_theme_explicit_v3";

export function ThemeSwitcher({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const [theme, setTheme] = React.useState<ThemeId>(defaultTheme);

  React.useEffect(() => {
    const explicit = localStorage.getItem(explicitKey) === "1";
    const stored = localStorage.getItem(storageKey);
    if (explicit && stored && isThemeId(stored)) setTheme(stored);
  }, []);

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
  }, [theme]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "text-xs uppercase tracking-[0.18em]",
          tone === "dark" ? "text-bg/60" : "text-fg/60"
        )}
      >
        Palette
      </span>
      <div className="relative">
        <select
          value={theme}
          onChange={(e) => {
            localStorage.setItem(explicitKey, "1");
            setTheme(e.target.value as ThemeId);
          }}
          className={cn(
            "h-10 rounded-full border pl-4 pr-10 text-sm transition",
            tone === "dark"
              ? "border-bg/20 bg-bg/10 text-bg hover:bg-bg/15"
              : "border-border bg-card text-fg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          )}
          aria-label="Choisir une palette de couleurs"
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
