"use client";

import { useMemo, useState } from "react";

type RecoveryItem = {
  url: string;
  productName: string;
  colorName: string;
};

type RecoveryState = {
  checked: number;
  restored: number;
  alreadyOk: number;
  notCached: number;
  failed: number;
};

type RecoveryLog = {
  url: string;
  status: "restored" | "already" | "not-cached" | "failed";
  message: string;
};

function filenameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/");
    return parts[parts.length - 1] || `recovery-${Date.now()}.jpg`;
  } catch {
    return `recovery-${Date.now()}.jpg`;
  }
}

function contentTypeFromUrl(url: string) {
  const file = filenameFromUrl(url).toLowerCase();
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".avif")) return "image/avif";
  return "image/jpeg";
}

export function ImageRecoveryPanel({ items }: { items: RecoveryItem[] }) {
  const [running, setRunning] = useState(false);
  const [state, setState] = useState<RecoveryState>({
    checked: 0,
    restored: 0,
    alreadyOk: 0,
    notCached: 0,
    failed: 0,
  });
  const [logs, setLogs] = useState<RecoveryLog[]>([]);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const total = items.length;
  const progress = total > 0 ? Math.round((state.checked / total) * 100) : 0;
  const topLogs = useMemo(() => logs.slice(0, 20), [logs]);

  const runRecovery = async () => {
    if (running || total === 0) return;

    setRunning(true);
    setLogs([]);
    setState({
      checked: 0,
      restored: 0,
      alreadyOk: 0,
      notCached: 0,
      failed: 0,
    });

    for (const item of items) {
      setActiveUrl(item.url);

      try {
        const exists = await fetch(item.url, { method: "HEAD", cache: "no-store" });
        if (exists.ok) {
          setState((prev) => ({
            ...prev,
            checked: prev.checked + 1,
            alreadyOk: prev.alreadyOk + 1,
          }));
          setLogs((prev) => [
            {
              url: item.url,
              status: "already",
              message: "Déjà en ligne",
            },
            ...prev,
          ]);
          continue;
        }

        const cached = await fetch(item.url, { cache: "force-cache" });
        if (!cached.ok) {
          setState((prev) => ({
            ...prev,
            checked: prev.checked + 1,
            notCached: prev.notCached + 1,
          }));
          setLogs((prev) => [
            {
              url: item.url,
              status: "not-cached",
              message: "Introuvable dans le cache du navigateur",
            },
            ...prev,
          ]);
          continue;
        }

        const blob = await cached.blob();
        const file = new File([blob], filenameFromUrl(item.url), {
          type: blob.type || contentTypeFromUrl(item.url),
        });
        const formData = new FormData();
        formData.set("originalUrl", item.url);
        formData.set("file", file);

        const restoreRes = await fetch("/api/admin/recover-blob", {
          method: "POST",
          body: formData,
        });
        const restoreJson = (await restoreRes.json()) as { ok?: boolean; error?: string };

        if (restoreRes.ok && restoreJson.ok) {
          setState((prev) => ({
            ...prev,
            checked: prev.checked + 1,
            restored: prev.restored + 1,
          }));
          setLogs((prev) => [
            {
              url: item.url,
              status: "restored",
              message: "Restaurée",
            },
            ...prev,
          ]);
          continue;
        }

        setState((prev) => ({
          ...prev,
          checked: prev.checked + 1,
          failed: prev.failed + 1,
        }));
        setLogs((prev) => [
          {
            url: item.url,
            status: "failed",
            message: restoreJson.error || "Erreur de restauration",
          },
          ...prev,
        ]);
      } catch {
        setState((prev) => ({
          ...prev,
          checked: prev.checked + 1,
          failed: prev.failed + 1,
        }));
        setLogs((prev) => [
          {
            url: item.url,
            status: "failed",
            message: "Erreur réseau",
          },
          ...prev,
        ]);
      }
    }

    setActiveUrl(null);
    setRunning(false);
  };

  return (
    <section className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-fg">Récupération des images supprimées</h2>
          <p className="mt-1 text-sm text-fg/65">
            Lance la restauration depuis ce navigateur. Les images déjà en cache ici
            peuvent être remises en ligne automatiquement.
          </p>
        </div>
        <button
          type="button"
          onClick={runRecovery}
          disabled={running || total === 0}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-fg bg-fg px-4 text-xs font-black uppercase tracking-[0.16em] text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? "Restauration..." : "Restaurer"}
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-bg px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fg/50">
            Total
          </div>
          <div className="mt-2 text-xl font-black text-fg">{total}</div>
        </div>
        <div className="rounded-xl border border-border bg-bg px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fg/50">
            Déjà ok
          </div>
          <div className="mt-2 text-xl font-black text-fg">{state.alreadyOk}</div>
        </div>
        <div className="rounded-xl border border-border bg-bg px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fg/50">
            Restaurées
          </div>
          <div className="mt-2 text-xl font-black text-fg">{state.restored}</div>
        </div>
        <div className="rounded-xl border border-border bg-bg px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fg/50">
            Pas en cache
          </div>
          <div className="mt-2 text-xl font-black text-fg">{state.notCached}</div>
        </div>
        <div className="rounded-xl border border-border bg-bg px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fg/50">
            Erreurs
          </div>
          <div className="mt-2 text-xl font-black text-fg">{state.failed}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.2em] text-fg/55">
          <span>Progression</span>
          <span>
            {state.checked}/{total} • {progress}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-fg transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {activeUrl ? (
        <div className="mt-4 rounded-xl border border-border bg-bg px-3 py-2 text-xs text-fg/60">
          En cours : {activeUrl}
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-border bg-bg p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fg/55">
          Derniers statuts
        </div>
        {topLogs.length === 0 ? (
          <div className="mt-3 text-sm text-fg/60">Aucun log pour le moment.</div>
        ) : (
          <div className="mt-3 max-h-72 space-y-2 overflow-auto text-xs">
            {topLogs.map((log) => (
              <div key={`${log.status}-${log.url}`} className="rounded-lg border border-border px-3 py-2 text-fg/70">
                <div className="font-black uppercase tracking-[0.16em] text-fg/65">
                  {log.message}
                </div>
                <div className="mt-1 break-all text-fg/55">{log.url}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
