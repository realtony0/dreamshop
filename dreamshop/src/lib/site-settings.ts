import "server-only";

import { prisma } from "@/lib/prisma";

export type SiteLink = {
  label: string;
  href: string;
};

export type HomeSettings = {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
  backgroundImage: string;
  overlayOpacity: number;
};

export type HeaderSettings = {
  brandName: string;
  links: SiteLink[];
};

export type FooterSettings = {
  brandName: string;
  tagline: string;
  links: SiteLink[];
};

export type CheckoutSettings = {
  baseCountry: string;
  internationalShipping: boolean;
  note: string;
};

export type SiteSettings = {
  home: HomeSettings;
  header: HeaderSettings;
  footer: FooterSettings;
  checkout: CheckoutSettings;
};

const defaultSettings: SiteSettings = {
  home: {
    eyebrow: "Base Sénégal • Livraison internationale",
    title: "Dreamshop",
    subtitle: "Pièces et ensembles premium streetwear.",
    buttonLabel: "Voir la boutique",
    buttonHref: "/shop",
    backgroundImage: "/lookbook/hero-shipping.jpg",
    overlayOpacity: 60,
  },
  header: {
    brandName: "Dreamshop",
    links: [
      { label: "Accueil", href: "/" },
      { label: "Boutique", href: "/shop" },
      { label: "Pièces", href: "/shop?category=HOODIE" },
      { label: "Ensembles", href: "/shop?category=SET" },
    ],
  },
  footer: {
    brandName: "Dreamshop",
    tagline: "Base au Sénégal, vente internationale.",
    links: [
      { label: "Boutique", href: "/shop" },
      { label: "Panier", href: "/cart" },
      { label: "Admin", href: "/admin" },
    ],
  },
  checkout: {
    baseCountry: "Sénégal",
    internationalShipping: true,
    note: "Base au Sénégal, livraison internationale.",
  },
};

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function clampOverlay(value: number) {
  if (!Number.isFinite(value)) return defaultSettings.home.overlayOpacity;
  return Math.max(0, Math.min(90, Math.round(value)));
}

function normalizeLinks(links: SiteLink[], fallback: SiteLink[]) {
  const normalized = links
    .map((link) => ({
      label: String(link.label ?? "").trim(),
      href: String(link.href ?? "").trim(),
    }))
    .filter((link) => link.label.length > 0 && link.href.length > 0);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeSettings(input: SiteSettings): SiteSettings {
  return {
    home: {
      eyebrow: input.home.eyebrow?.trim() || defaultSettings.home.eyebrow,
      title: input.home.title?.trim() || defaultSettings.home.title,
      subtitle: input.home.subtitle?.trim() || defaultSettings.home.subtitle,
      buttonLabel: input.home.buttonLabel?.trim() || defaultSettings.home.buttonLabel,
      buttonHref: input.home.buttonHref?.trim() || defaultSettings.home.buttonHref,
      backgroundImage:
        input.home.backgroundImage?.trim() || defaultSettings.home.backgroundImage,
      overlayOpacity: clampOverlay(input.home.overlayOpacity),
    },
    header: {
      brandName: input.header.brandName?.trim() || defaultSettings.header.brandName,
      links: normalizeLinks(input.header.links ?? [], defaultSettings.header.links),
    },
    footer: {
      brandName: input.footer.brandName?.trim() || defaultSettings.footer.brandName,
      tagline: input.footer.tagline?.trim() || defaultSettings.footer.tagline,
      links: normalizeLinks(input.footer.links ?? [], defaultSettings.footer.links),
    },
    checkout: {
      baseCountry: input.checkout.baseCountry?.trim() || defaultSettings.checkout.baseCountry,
      internationalShipping: Boolean(input.checkout.internationalShipping),
      note: input.checkout.note?.trim() || defaultSettings.checkout.note,
    },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.keys(defaultSettings) } },
    });
    const map = new Map(rows.map((row) => [row.key, row.value]));

    const settings: SiteSettings = {
      home: safeJsonParse(map.get("home") ?? "", defaultSettings.home),
      header: safeJsonParse(map.get("header") ?? "", defaultSettings.header),
      footer: safeJsonParse(map.get("footer") ?? "", defaultSettings.footer),
      checkout: safeJsonParse(map.get("checkout") ?? "", defaultSettings.checkout),
    };
    return normalizeSettings(settings);
  } catch {
    return defaultSettings;
  }
}

export async function getHomeSettings() {
  const settings = await getSiteSettings();
  return settings.home;
}

export async function getHeaderSettings() {
  const settings = await getSiteSettings();
  return settings.header;
}

export async function getFooterSettings() {
  const settings = await getSiteSettings();
  return settings.footer;
}

export async function getCheckoutSettings() {
  const settings = await getSiteSettings();
  return settings.checkout;
}

export async function saveSiteSection<K extends keyof SiteSettings>(
  section: K,
  value: SiteSettings[K]
) {
  const current = await getSiteSettings();
  const merged = normalizeSettings({
    ...current,
    [section]: value,
  } as SiteSettings);

  await prisma.siteSetting.upsert({
    where: { key: section },
    create: {
      key: section,
      value: JSON.stringify(merged[section]),
    },
    update: {
      value: JSON.stringify(merged[section]),
    },
  });
}

export function serializeLinks(links: SiteLink[]) {
  return links.map((link) => `${link.label}|${link.href}`).join("\n");
}

export function parseLinks(text: string, fallback: SiteLink[]) {
  const links = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part?.trim() ?? "");
      return { label, href };
    })
    .filter((link) => link.label.length > 0 && link.href.length > 0);

  return normalizeLinks(links, fallback);
}

export const siteDefaults = defaultSettings;
