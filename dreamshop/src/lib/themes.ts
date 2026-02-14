export const themes = [
  { id: "crock", label: "Bleu Glacier" },
  { id: "mono", label: "Noir / Blanc" },
  { id: "sand", label: "Beige / Marron" },
  { id: "slate", label: "Gris / Bleu" },
  { id: "white", label: "Full White" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export function isThemeId(value: string): value is ThemeId {
  return themes.some((t) => t.id === value);
}

export const defaultTheme: ThemeId = isThemeId(
  process.env.NEXT_PUBLIC_DEFAULT_THEME ?? ""
)
  ? (process.env.NEXT_PUBLIC_DEFAULT_THEME as ThemeId)
  : "crock";
