"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { sizes, type Size } from "@/lib/sizes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageDraft = {
  url: string;
  alt: string;
};

type VariantDraft = {
  colorName: string;
  colorHex: string;
  images: ImageDraft[];
  stock: Record<Size, number>;
};

export type ProductDraft = {
  name: string;
  slug: string;
  description: string;
  category: "HOODIE" | "SET";
  price: string;
  featured: boolean;
  active: boolean;
  variants: VariantDraft[];
};

const quickColors = ["Noir", "Gris", "Blanc", "Beige", "Bleu", "Marron"] as const;
const defaultStockQuantity = 999;

const colorHexMap: Record<string, string> = {
  noir: "#0a0a0a",
  gris: "#6b7280",
  blanc: "#f3f4f6",
  beige: "#d6c2a3",
  bleu: "#4b7fb4",
  marron: "#6f4e37",
};

function getStoredAdminCode() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("ds_admin_code") ?? "";
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function emptyStock(): Record<Size, number> {
  return Object.fromEntries(
    sizes.map((size) => [size, defaultStockQuantity])
  ) as Record<Size, number>;
}

function guessColorHex(colorName: string) {
  return colorHexMap[colorName.trim().toLowerCase()] ?? "";
}

function newVariant(defaultColor = "Noir"): VariantDraft {
  return {
    colorName: defaultColor,
    colorHex: guessColorHex(defaultColor),
    images: [],
    stock: emptyStock(),
  };
}

function emptyProduct(): ProductDraft {
  return {
    name: "",
    slug: "",
    description: "",
    category: "HOODIE",
    price: "30000",
    featured: true,
    active: true,
    variants: [newVariant()],
  };
}

export function ProductEditor({
  productId,
  initial,
}: {
  productId?: string;
  initial?: ProductDraft;
}) {
  const isEditing = Boolean(productId);
  const router = useRouter();

  const [draft, setDraft] = React.useState<ProductDraft>(initial ?? emptyProduct());
  const [openVariantIndex, setOpenVariantIndex] = React.useState(0);
  const [uploadingVariant, setUploadingVariant] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (draft.variants.length === 0) {
      setDraft((current) => ({ ...current, variants: [newVariant()] }));
      setOpenVariantIndex(0);
      return;
    }
    if (openVariantIndex >= draft.variants.length) {
      setOpenVariantIndex(draft.variants.length - 1);
    }
  }, [draft.variants.length, openVariantIndex]);

  function update<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateName(nextName: string) {
    setDraft((current) => ({
      ...current,
      name: nextName,
      slug: isEditing ? current.slug : slugify(nextName),
    }));
  }

  function updateVariant(index: number, next: Partial<VariantDraft>) {
    setDraft((current) => ({
      ...current,
      variants: current.variants.map((variant, i) =>
        i === index ? { ...variant, ...next } : variant
      ),
    }));
  }

  function setVariantColor(index: number, colorName: string) {
    updateVariant(index, {
      colorName,
      colorHex: guessColorHex(colorName) || draft.variants[index]?.colorHex || "",
    });
  }

  function addVariant() {
    setDraft((current) => {
      const nextVariants = [...current.variants, newVariant("Gris")];
      setOpenVariantIndex(nextVariants.length - 1);
      return { ...current, variants: nextVariants };
    });
  }

  function removeVariant(index: number) {
    if (draft.variants.length <= 1) return;
    setDraft((current) => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index),
    }));
    setOpenVariantIndex((current) => {
      if (current === index) return 0;
      if (current > index) return current - 1;
      return current;
    });
  }

  function removeVariantImage(variantIndex: number, imageIndex: number) {
    updateVariant(variantIndex, {
      images: draft.variants[variantIndex].images.filter((_, i) => i !== imageIndex),
    });
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const adminCode = getStoredAdminCode();
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: adminCode ? { "x-admin-code": adminCode } : undefined,
    });
    const data = (await response.json()) as {
      ok?: boolean;
      url?: string;
      error?: string;
    };

    if (!response.ok || !data.ok || !data.url) {
      throw new Error(data.error ?? "Upload impossible.");
    }
    return data.url;
  }

  async function uploadVariantImages(index: number, files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploadingVariant(index);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        urls.push(url);
      }

      updateVariant(index, {
        images: [
          ...draft.variants[index].images,
          ...urls.map((url) => ({ url, alt: "" })),
        ],
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload impossible.");
    } finally {
      setUploadingVariant(null);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);

    const name = draft.name.trim();
    if (!name) {
      setError("Ajoute un nom produit.");
      setSaving(false);
      return;
    }

    const slug = isEditing ? draft.slug.trim() : slugify(name);
    if (!slug) {
      setError("Nom invalide pour créer le produit.");
      setSaving(false);
      return;
    }

    const digits = String(draft.price).replace(/[^\d]/g, "");
    const price = digits ? Number(digits) : NaN;
    const priceCents = Number.isFinite(price) ? Math.max(0, Math.round(price)) : NaN;
    if (!Number.isFinite(priceCents)) {
      setError("Prix invalide.");
      setSaving(false);
      return;
    }

    const cleanedVariants = draft.variants.map((variant, index) => {
      const colorName = variant.colorName.trim() || `Couleur ${index + 1}`;
      const images = variant.images
        .map((image, sort) => ({
          url: image.url.trim(),
          alt: image.alt.trim() || `${name} ${colorName}`,
          sort,
        }))
        .filter((image) => image.url.length > 0);
      return {
        colorName,
        colorHex: variant.colorHex.trim() || null,
        images,
        stock: sizes.map((size) => ({
          size,
          quantity: Number(variant.stock[size] ?? 0),
        })),
      };
    });

    if (cleanedVariants.some((variant) => variant.images.length === 0)) {
      setError("Ajoute au moins une photo pour chaque couleur.");
      setSaving(false);
      return;
    }

    const payload = {
      name,
      slug,
      description: draft.description.trim() || "Produit premium streetwear.",
      category: draft.category,
      priceCents,
      featured: draft.featured,
      active: draft.active,
      variants: cleanedVariants,
    };

    const endpoint = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PUT" : "POST";

    try {
      const adminCode = getStoredAdminCode();
      const response = await fetch(endpoint, {
        method,
        headers: {
          "content-type": "application/json",
          ...(adminCode ? { "x-admin-code": adminCode } : {}),
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Enregistrement impossible.");
        setSaving(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Erreur réseau.");
      setSaving(false);
    }
  }

  async function removeProduct() {
    if (!productId) return;
    if (!confirm("Supprimer ce produit ?")) return;

    setSaving(true);
    setError(null);
    try {
      const adminCode = getStoredAdminCode();
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: adminCode ? { "x-admin-code": adminCode } : undefined,
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Suppression impossible.");
        setSaving(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Erreur réseau.");
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/55">
            Admin produits
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-fg md:text-4xl">
            {isEditing ? "Modifier produit" : "Nouveau produit"}
          </h1>
          <div className="mt-2 text-sm text-fg/65">
            1) Infos  2) Couleurs + photos  3) Enregistrer
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-bg px-4 text-sm font-black uppercase tracking-[0.16em] text-fg transition hover:bg-muted"
          >
            Retour
          </Link>
          {isEditing ? (
            <button
              onClick={removeProduct}
              disabled={saving}
              className="h-11 rounded-xl border border-border bg-bg px-4 text-sm font-black uppercase tracking-[0.16em] text-fg transition hover:bg-muted disabled:opacity-60"
            >
              Supprimer
            </button>
          ) : null}
          <button
            onClick={save}
            disabled={saving}
            className="h-11 rounded-xl border border-border bg-fg px-5 text-sm font-black uppercase tracking-[0.16em] text-bg transition hover:bg-fg/90 disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-card px-5 py-4 text-sm font-medium text-fg/85 ring-1 ring-border/60">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-border/50 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Nom du produit</Label>
          <Input
            id="name"
            value={draft.name}
            onChange={(e) => updateName(e.target.value)}
            placeholder="Ex: Lululemon Tech Set"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Type de produit</Label>
          <select
            id="category"
            value={draft.category}
            onChange={(e) => update("category", e.target.value as ProductDraft["category"])}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm font-medium text-fg outline-none transition focus:ring-2 focus:ring-accent/35"
          >
            <option value="HOODIE">Piece</option>
            <option value="SET">Ensemble</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="price">Prix (FCFA)</Label>
          <Input
            id="price"
            value={draft.price}
            onChange={(e) => update("price", e.target.value)}
            inputMode="numeric"
            placeholder="30000"
          />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="desc">Description courte</Label>
          <textarea
            id="desc"
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
            className="min-h-24 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg outline-none transition placeholder:text-fg/40 focus:ring-2 focus:ring-accent/35"
            placeholder="Ex: Coupe premium, très confortable."
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-fg/80">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => update("active", e.target.checked)}
            />
            Visible en boutique
          </label>
          <label className="flex items-center gap-2 text-sm text-fg/80">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => update("featured", e.target.checked)}
            />
            Afficher sur accueil
          </label>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-black uppercase tracking-[0.18em] text-fg/65">
            Couleurs et photos
          </div>
          <button
            onClick={addVariant}
            className="h-10 rounded-xl border border-border bg-bg px-4 text-xs font-black uppercase tracking-[0.16em] text-fg transition hover:bg-muted"
          >
            + Ajouter couleur
          </button>
        </div>

        <div className="grid gap-3">
          {draft.variants.map((variant, index) => {
            const isOpen = openVariantIndex === index;
            return (
              <article
                key={index}
                className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-fg/55">
                      Couleur {index + 1}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border border-fg/20"
                        style={{ backgroundColor: variant.colorHex || "#9ca3af" }}
                      />
                      <div className="text-lg font-black text-fg">
                        {variant.colorName || "Sans nom"}
                      </div>
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-fg/45">
                      {variant.images.length} photo{variant.images.length > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setOpenVariantIndex((current) => (current === index ? -1 : index))
                      }
                      className="h-9 rounded-xl border border-border bg-bg px-3 text-xs font-black uppercase tracking-[0.14em] text-fg transition hover:bg-muted"
                    >
                      {isOpen ? "Masquer" : "Ouvrir"}
                    </button>
                    <button
                      onClick={() => removeVariant(index)}
                      disabled={draft.variants.length <= 1}
                      className={cn(
                        "h-9 rounded-xl border border-border bg-bg px-3 text-xs font-black uppercase tracking-[0.14em] text-fg transition hover:bg-muted",
                        draft.variants.length <= 1 && "opacity-40"
                      )}
                    >
                      Retirer
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-4 grid gap-4 border-t border-border/70 pt-4">
                    <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
                      <div className="grid gap-2">
                        <Label>Nom couleur</Label>
                        <Input
                          value={variant.colorName}
                          onChange={(e) => setVariantColor(index, e.target.value)}
                          placeholder="Ex: Noir"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setVariantColor(index, color)}
                            className="h-9 rounded-xl border border-border bg-bg px-3 text-xs font-black uppercase tracking-[0.14em] text-fg transition hover:bg-muted"
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                        Photos
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label
                          htmlFor={`variant-upload-${index}`}
                          className={cn(
                            "inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-fg px-4 text-xs font-black uppercase tracking-[0.16em] text-bg transition hover:bg-fg/90",
                            uploadingVariant === index && "pointer-events-none opacity-60"
                          )}
                        >
                          {uploadingVariant === index ? "Upload..." : "Uploader photos"}
                        </label>
                        <input
                          id={`variant-upload-${index}`}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            await uploadVariantImages(index, e.currentTarget.files);
                            e.currentTarget.value = "";
                          }}
                        />
                        <span className="text-xs text-fg/50">
                          Clique puis choisis les images.
                        </span>
                      </div>

                      {variant.images.length === 0 ? (
                        <div className="rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg/60">
                          Aucune photo. Upload au moins une photo avant d’enregistrer.
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                          {variant.images.map((image, imageIndex) => (
                            <div
                              key={`${image.url}-${imageIndex}`}
                              className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted"
                            >
                              <Image
                                src={image.url}
                                alt={image.alt || variant.colorName}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                              <button
                                onClick={() => removeVariantImage(index, imageIndex)}
                                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-xs font-black text-white"
                                aria-label="Supprimer la photo"
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-black uppercase tracking-[0.18em] text-fg/55">
                      Stock gere automatiquement.
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
