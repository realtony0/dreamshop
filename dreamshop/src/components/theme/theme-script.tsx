import { defaultTheme, themes } from "@/lib/themes";

export function ThemeScript() {
  const themeIds = themes.map((t) => t.id);
  const code = `(() => {
  try {
    const key = "ds_theme_v3";
    const explicitKey = "ds_theme_explicit_v3";
    const stored = localStorage.getItem(key);
    const explicit = localStorage.getItem(explicitKey) === "1";
    const allowed = ${JSON.stringify(themeIds)};
    const ok = (v) => allowed.includes(v);
    const theme = explicit && stored && ok(stored) ? stored : "${defaultTheme}";
    document.documentElement.dataset.theme = theme;
  } catch {}
})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
