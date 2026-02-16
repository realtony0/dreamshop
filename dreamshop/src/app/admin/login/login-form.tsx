"use client";

import * as React from "react";
import type { AdminLoginState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  nextPath: string;
  action: (
    prevState: AdminLoginState,
    formData: FormData
  ) => Promise<AdminLoginState>;
};

export function LoginForm({ nextPath, action }: LoginFormProps) {
  const [state, formAction, pending] = React.useActionState(action, {});
  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const formData = new FormData(event.currentTarget);
      const code = String(formData.get("code") ?? "").trim();
      if (!code) return;
      try {
        window.localStorage.setItem("ds_admin_code", code);
      } catch {
        // ignore storage errors
      }
    },
    []
  );

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-8 grid gap-5">
      <input type="hidden" name="next" value={nextPath} />

      <div className="grid gap-2">
        <Label htmlFor="code">Code Admin</Label>
        <Input
          id="code"
          name="code"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
        />
      </div>

      {state.error ? (
        <div className="rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg/80">
          {state.error}
        </div>
      ) : null}

      <button
        disabled={pending}
        className="h-12 w-full rounded-xl border border-border bg-fg text-sm font-black uppercase tracking-wider text-bg transition hover:bg-fg/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
