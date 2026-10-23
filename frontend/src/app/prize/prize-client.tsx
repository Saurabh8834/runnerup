"use client";

import { Medal, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function PrizeSearchClient() {
  const [bib, setBib] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = bib.trim();
    if (v) window.location.href = `/prize/${encodeURIComponent(v)}`;
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
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
              Track Your Prizes & Medals
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-(--muted) sm:text-base">
              Enter your bib number, email, or registered phone number to check the dispatch status of your metal finisher medal, e-certificate, and event kit.
            </p>

            <form className="mt-8 mx-auto flex max-w-md gap-2" onSubmit={handleSubmit}>
              <input
                autoComplete="off"
                className="input flex-1 h-12 px-4 text-base"
                onChange={(e) => setBib(e.target.value)}
                placeholder="Bib number, email, or phone"
                type="text"
                value={bib}
                aria-label="Bib number, email, or registered phone"
              />
              <button
                className="btn btn-primary h-12 w-12 shrink-0 cursor-pointer"
                disabled={!bib.trim()}
                type="submit"
                aria-label="Search prize tracking"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-page">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-lg font-bold tracking-tight text-(--foreground)">
              How prize tracking & medal delivery works
            </h2>
            <div className="mt-6 grid gap-4 text-left">
              {[
                {
                  step: "1",
                  title: "Register for an event",
                  desc: "Choose your distance, complete payment, and get your bib number allocated instantly.",
                },
                {
                  step: "2",
                  title: "Complete your run & upload proof",
                  desc: "Use any GPS app (Strava, Garmin, NRC), screenshot your activity, and submit it for verification.",
                },
                {
                  step: "3",
                  title: "Get verified & unlock prizes",
                  desc: "Our arbiters approve your proof — e-certificate is unlocked instantly and your solid metal medal is dispatched.",
                },
                {
                  step: "4",
                  title: "Track everything here",
                  desc: "Use your bib number or phone anytime to check real-time courier tracking and delivery status.",
                },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-xl border border-(--line) bg-(--panel) p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sage) text-sm font-bold text-white">
                    {step}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">{title}</p>
                    <p className="mt-0.5 text-xs text-(--muted)">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-(--muted-soft)">
              Already registered?{" "}
              <Link className="text-(--sage) underline-offset-2 hover:underline" href="/dashboard">
                Go to runner dashboard →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
