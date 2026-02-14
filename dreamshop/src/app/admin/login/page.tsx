import Link from "next/link";
import { LoginForm } from "./login-form";
import { adminLoginAction } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nextPath = typeof sp.next === "string" ? sp.next : "/admin";

  return (
    <div className="mx-auto flex min-h-dvh max-w-[560px] items-center px-4 py-14">
      <div className="w-full rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border/50 md:p-10">
        <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/60">
          Admin
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-fg">
          Connexion
        </h1>
        <p className="mt-2 text-sm text-fg/65">
          Accès protégé.{" "}
          <Link href="/" className="underline underline-offset-4">
            Retour boutique
          </Link>
          .
        </p>

        <LoginForm nextPath={nextPath} action={adminLoginAction} />

        <div className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-fg/45">
          Code via <code className="text-fg/70">ADMIN_CODE</code>
        </div>
      </div>
    </div>
  );
}
