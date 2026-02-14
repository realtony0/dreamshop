import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { Container } from "@/components/site/container";
import { getFeaturedProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProducts(6);

  return (
    <div>
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/lookbook/hero-shipping.jpg"
            alt="Dreamshop hero"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,16,36,0.38)_0%,rgba(2,16,36,0.72)_100%)]" />
        </div>

        <Container className="relative z-10 flex min-h-screen flex-col justify-center py-24 text-center">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-white/80">
            Drop limité • Lululemon • Tech fleece
          </div>
          <h1
            className="mt-5 font-[var(--font-space)] text-6xl font-black uppercase leading-none tracking-tight text-white md:text-8xl lg:text-9xl"
            style={{ textShadow: "4px 4px 12px rgba(0,0,0,0.9)" }}
          >
            Lululemon
            <br />
            <span className="text-accent">street sets</span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-xl text-base font-medium text-white/85 md:text-lg lg:text-xl"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
          >
            Pieces et ensembles premium. Coupe propre, stock reel par taille, livraison rapide.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-3 border-2 border-accent/80 bg-accent px-8 py-4 text-sm font-black uppercase tracking-widest text-bg shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-accent/90 md:px-12 md:py-6 md:text-base"
            >
              Voir la boutique
            </Link>
            <Link
              href="/shop?category=SET"
              className="inline-flex items-center justify-center border-2 border-bg/45 bg-transparent px-8 py-4 text-sm font-black uppercase tracking-widest text-bg transition-colors hover:bg-bg/10 md:px-12 md:py-6 md:text-base"
            >
              Voir les ensembles
            </Link>
          </div>
        </Container>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 md:bottom-10">
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-bg/60">
            <div className="mt-2 h-3 w-1 animate-pulse rounded-full bg-bg/85" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tight text-fg md:text-5xl">
              Sélection du moment
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-fg/60">
              Les pièces les plus demandées cette semaine.
            </p>
          </div>

        {featured.length === 0 ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl bg-card p-8 text-sm text-fg/70 shadow-sm ring-1 ring-border/60">
            Aucun produit pour le moment. Ajoute des produits via{" "}
            <Link href="/admin" className="underline underline-offset-4">
              /admin
            </Link>
            .
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        </Container>
      </section>
    </div>
  );
}
