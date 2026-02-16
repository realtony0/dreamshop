import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-server";
import { Container } from "@/components/site/container";

const navLink =
  "inline-flex h-10 items-center rounded-lg border border-border bg-bg px-3 text-[11px] font-black uppercase tracking-[0.14em] text-fg/75 transition hover:bg-muted hover:text-fg";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-lg font-black tracking-tight text-fg">
              Admin
            </Link>
            <div className="rounded-full border border-border bg-bg px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-fg/55">
              {session.label}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/site" className={navLink}>
              Site
            </Link>
            <Link href="/admin/products" className={navLink}>
              Produits
            </Link>
            <Link href="/admin/orders" className={navLink}>
              Commandes
            </Link>
            <Link href="/" className={navLink}>
              Boutique
            </Link>
            <Link href="/admin/logout" className={navLink}>
              Logout
            </Link>
          </div>
        </Container>
      </header>

      <main className="py-12 md:py-16">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
