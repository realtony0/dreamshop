import { Suspense, type ReactNode } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { MobileAppNav } from "@/components/site/mobile-app-nav";
import { Providers } from "@/components/site/providers";
import { getFooterSettings, getHeaderSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [header, footer] = await Promise.all([getHeaderSettings(), getFooterSettings()]);

  return (
    <Providers>
      <div className="min-h-dvh bg-bg">
        <Header brandName={header.brandName} links={header.links} />
        <main>{children}</main>
        <Footer brandName={footer.brandName} tagline={footer.tagline} links={footer.links} />
        <Suspense fallback={null}>
          <MobileAppNav />
        </Suspense>
      </div>
    </Providers>
  );
}
