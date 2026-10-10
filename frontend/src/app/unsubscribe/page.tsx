"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useState, Suspense } from "react";
import { PageShell } from "../components/app-shell";
import { getApiUrl } from "../../lib/api";
import { Check, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { validateEmail } from "../../lib/validation";

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromUrl = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailFromUrl);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailErr = validateEmail(trimmed);
    if (emailErr) { setError(emailErr); return; }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(getApiUrl("/api/subscribers/unsubscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? "Unsubscription failed");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, [email]);

  if (done) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--sage)/10">
          <Check className="h-8 w-8 text-(--sage)" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Unsubscribed</h2>
        <p className="mt-2 text-sm text-(--muted)">
          {emailFromUrl
            ? "You've been removed from our mailing list."
            : "If that email was in our list, it's been removed."}
        </p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-(--sage) px-5 py-2 text-sm font-medium text-white">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--sage)/10">
        <Mail className="h-8 w-8 text-(--sage)" />
      </div>
      <h2 className="mt-4 text-center text-lg font-semibold">Unsubscribe</h2>
      <p className="mt-1 text-center text-sm text-(--muted)">
        Enter your email to unsubscribe from RunnerUp updates.
      </p>
      <form onSubmit={onSubmit} noValidate className="mt-6">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="h-10 w-full rounded-lg border border-(--line) bg-(--panel) px-3 text-sm text-(--foreground) placeholder:text-(--muted-soft) focus:border-(--sage)/40 focus:outline-none focus:ring-2 focus:ring-(--sage)/10"
        />
        {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-(--sage) px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Unsubscribing…" : "Unsubscribe"}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/" className="text-xs text-(--muted) underline hover:text-(--foreground)">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <PageShell>
      <div className="container-page py-20">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-(--muted)" />
          </div>
        }>
          <UnsubscribeForm />
        </Suspense>
      </div>
    </PageShell>
  );
}
