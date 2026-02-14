import { Suspense, type ReactNode } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { MobileAppNav } from "@/components/site/mobile-app-nav";
import { Providers } from "@/components/site/providers";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-dvh bg-bg">
        <Header />
        <main>{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <MobileAppNav />
        </Suspense>
      </div>
    </Providers>
  );
}
