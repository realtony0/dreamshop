import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { getHomeSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await getHomeSettings();

  return (
    <section className="relative min-h-[88svh] overflow-hidden md:min-h-screen">
      <div className="absolute inset-0">
        <Image
          src={home.backgroundImage}
          alt={home.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[#021024]"
          style={{ opacity: Math.max(0, Math.min(90, home.overlayOpacity)) / 100 }}
        />
      </div>

      <Container className="relative z-10 flex min-h-[88svh] flex-col justify-center py-16 text-center md:min-h-screen md:py-24">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/80 sm:text-xs">
          {home.eyebrow}
        </div>
        <h1
          className="mt-4 font-[var(--font-space)] text-5xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl md:mt-5 md:text-8xl"
          style={{ textShadow: "4px 4px 12px rgba(0,0,0,0.72)" }}
        >
          {home.title}
        </h1>
        <p
          className="mx-auto mt-5 max-w-xl text-sm font-medium text-white/90 sm:text-base md:mt-6 md:text-lg"
          style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.65)" }}
        >
          {home.subtitle}
        </p>

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            href={home.buttonHref}
            className="inline-flex h-12 items-center justify-center border-2 border-accent/80 bg-accent px-8 text-xs font-black uppercase tracking-[0.2em] text-bg shadow-2xl transition hover:bg-accent/90 sm:h-auto sm:px-10 sm:py-4 sm:text-sm"
          >
            {home.buttonLabel}
          </Link>
        </div>
      </Container>
    </section>
  );
}
