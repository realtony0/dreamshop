import type { ReactNode } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Providers } from "@/components/site/providers";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-dvh">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}

