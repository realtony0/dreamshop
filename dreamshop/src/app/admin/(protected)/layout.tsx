import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-server";
import { Container } from "@/components/site/container";

const navLink =
  "text-xs font-medium uppercase tracking-[0.22em] text-white/80 hover:text-white transition";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur">
        <Container className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-semibold uppercase tracking-[0.34em] text-white"
            >
              Admin
            </Link>
            <nav className="hidden items-center gap-7 md:flex">
              <Link href="/admin" className={navLink}>
                Dashboard
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
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-xs uppercase tracking-[0.22em] text-white/60 md:block">
              {session.email}
            </div>
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
