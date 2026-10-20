"use client";

import { ArrowRight, Medal, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { PageShell } from "../components/app-shell";

export default function PrizeSearchPage() {
  const [bib, setBib] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = bib.trim();
    if (v) window.location.href = `/prize/${encodeURIComponent(v)}`;
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-(--line)">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--sage) 14%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)",
              "var(--background)",
            ].join(", "),
          }}
        />
        <div className="container-page py-16 sm:py-20">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--sage-soft) text-(--sage)">
              <Medal className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
              Track your prizes
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-(--muted) sm:text-base">
              Enter your bib number, email, or registered phone number to check the status of your certificate, medal, and other event rewards.
            </p>

            <form className="mt-8 mx-auto flex max-w-md gap-2" onSubmit={handleSubmit}>
              <input
                autoComplete="off"
                className="input flex-1 h-12 px-4 text-base"
                onChange={(e) => setBib(e.target.value)}
                placeholder="Bib number, email, or phone"
                type="text"
                value={bib}
              />
              <button className="btn btn-primary h-12 w-12 shrink-0 cursor-pointer" disabled={!bib.trim()} type="submit">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-page">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-lg font-bold tracking-tight text-(--foreground)">How prize tracking works</h2>
            <div className="mt-6 grid gap-4 text-left">
              {[
                { step: "1", title: "Register for an event", desc: "Choose your distance, complete payment, and get your bib number." },
                { step: "2", title: "Complete your run & upload proof", desc: "Use any GPS app, screenshot your activity, and submit it for verification." },
                { step: "3", title: "Get verified & unlock prizes", desc: "Admin approves your proof — certificate, medal, and goodies are on the way." },
                { step: "4", title: "Track everything here", desc: "Use your bib number anytime to check the status." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3 rounded-xl border border-(--line) bg-(--panel) p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sage) text-sm font-bold text-white">{step}</span>
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">{title}</p>
                    <p className="mt-0.5 text-xs text-(--muted)">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-(--muted-soft)">
              Already know your bib?{" "}
              <Link className="text-(--sage) underline-offset-2 hover:underline" href="/dashboard">Go to dashboard →</Link>
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
