"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Check, Copy, Gift, Share2, Sparkles, Users, IndianRupee, ArrowUpRight, LogIn, UserPlus, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { authHeaders, getApiUrl } from "../../lib/api";
import { Breadcrumb } from "../components/breadcrumb";

type ReferralData = {
  code: string;
  link: string;
  totalReferrals: number;
  converted: number;
};

function ReferSignedIn() {
  const { getToken, isLoaded } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(getApiUrl("/api/referrals/code"), { headers: authHeaders(token) });
      if (!res.ok) return;
      const json = await res.json();
      setData(json.data as ReferralData);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { if (isLoaded) void load(); }, [isLoaded, load]);

  const copyLink = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const getWhatsAppUrl = () => {
    if (!data) return "#";
    const text = encodeURIComponent(`Join me on RunnerUp — virtual running events across India! Sign up using my referral link: ${data.link}`);
    return `https://wa.me/?text=${text}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--line-strong) border-t-(--sage)" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-(--line) bg-(--panel) p-8 text-center">
        <p className="text-sm text-(--muted)">Could not load referral info. Try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral code card */}
      <div className="overflow-hidden rounded-2xl border border-(--line) bg-(--panel)">
        <div className="bg-gradient-to-r from-(--sage)/10 to-(--sage)/5 px-5 py-4">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-(--sage)">Your referral</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-(--panel-soft) px-4 py-3">
            <div>
              <p className="text-xs text-(--muted)">Your code</p>
              <p className="mt-0.5 text-2xl font-bold tracking-wider text-(--foreground) font-mono">{data.code}</p>
            </div>
            <button onClick={copyLink} className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--sage) text-white transition-all hover:bg-emerald-600 active:scale-95" type="button" aria-label="Copy referral link">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div>
            <p className="text-xs text-(--muted) mb-2">Share your link</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input readOnly value={data.link} className="input w-full min-w-0 text-xs truncate bg-(--panel-soft) sm:flex-1" onClick={(e) => (e.target as HTMLInputElement).select()} />
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full shrink-0 text-xs gap-1.5 sm:w-auto">
                <Share2 className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-(--line) bg-(--panel) p-4 text-center">
          <Users className="mx-auto h-5 w-5 text-(--muted-soft)" />
          <p className="mt-2 text-2xl font-bold tracking-tight text-(--foreground)">{data.totalReferrals}</p>
          <p className="mt-0.5 text-xs text-(--muted-soft)">Total referrals</p>
        </div>
        <div className="rounded-xl border border-(--line) bg-(--panel) p-4 text-center">
          <CheckCircle className="mx-auto h-5 w-5 text-(--sage)" />
          <p className="mt-2 text-2xl font-bold tracking-tight text-(--foreground)">{data.converted}</p>
          <p className="mt-0.5 text-xs text-(--muted-soft)">Converted</p>
        </div>
      </div>

      <p className="text-xs text-center text-(--muted-soft) leading-relaxed">
        Earn rewards when your friends sign up and register for an event. Rewards are credited after their registration is confirmed.
      </p>
    </div>
  );
}

export function ReferClient() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-(--line)">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: ["radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--sage) 12%, transparent) 0%, transparent 60%)", "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)", "var(--background)"].join(", ") }}
        />
        <div className="container-page py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Refer & Earn</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-5xl md:text-6xl">
              Invite friends,{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-(--sage) to-indigo-400 bg-clip-text text-transparent">earn rewards</span>
            </h1>
            <p className="lede mx-auto mt-4 max-w-lg">
              Share the joy of virtual running. For every friend who signs up and registers using your referral link, you both earn rewards.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              {!isLoaded ? null : !isSignedIn ? (
                <>
                  <Link className="btn btn-primary" href="/sign-up"><UserPlus className="h-4 w-4" /> Create account</Link>
                  <Link className="btn btn-secondary" href="/sign-in"><LogIn className="h-4 w-4" /> Sign in</Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Signed-in referral dashboard */}
      {isLoaded && isSignedIn ? (
        <section className="border-b border-(--line) bg-(--panel-soft)/50">
          <div className="container-page py-8 sm:py-10">
            <div className="mx-auto max-w-lg">
              <ReferSignedIn />
            </div>
          </div>
        </section>
      ) : null}

      {/* How it works */}
      <section className="border-b border-(--line)">
        <div className="container-page py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow text-center">How it works</p>
            <h2 className="mt-3 text-center text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl">
              Three simple steps
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { step: "01", icon: UserPlus, title: "Create account", desc: "Sign up for free on RunnerUp. Get your unique referral code instantly." },
                { step: "02", icon: Share2, title: "Share your link", desc: "Send your referral link to friends, family, and running groups on WhatsApp or social media." },
                { step: "03", icon: Gift, title: "Earn rewards", desc: "When they register for an event, you both earn rewards. The more you refer, the more you earn." },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="rounded-2xl border border-(--line) bg-(--panel) p-6 text-center transition-all hover:border-(--sage)/20 hover:shadow-sm">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-(--sage-soft) text-(--sage)">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-4 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted-soft)">{step}</p>
                  <p className="mt-2 text-base font-bold text-(--foreground)">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-(--muted)">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="border-b border-(--line) bg-(--panel-soft)/30">
        <div className="container-page py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow text-center">Rewards</p>
            <h2 className="mt-3 text-center text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl">
              What you earn
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { icon: IndianRupee, title: "Referral discount", desc: "Get ₹100 off your next event registration for each friend who signs up using your code." },
                { icon: Users, title: "Friend also benefits", desc: "Your friend gets ₹100 off their first registration too. It's a win-win!" },
                { icon: Sparkles, title: "No limit", desc: "Refer as many friends as you want. There's no cap on how much you can earn." },
                { icon: Gift, title: "Extra perks", desc: "Top referrers each season get exclusive RunnerUp merch and free entries." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 rounded-xl border border-(--line) bg-(--panel) p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--sage-soft) text-(--sage)">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-(--foreground)">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-(--muted)">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container-page py-12 sm:py-16">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl">
              Ready to start?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-(--muted)">
              {isSignedIn
                ? "Your referral code is ready above. Share it and start earning rewards today."
                : "Create your free account in under a minute and get your personalized referral link."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {!isLoaded ? null : !isSignedIn ? (
                <>
                  <Link className="btn btn-primary" href="/sign-up"><UserPlus className="h-4 w-4" /> Create free account</Link>
                  <Link className="btn btn-secondary" href="/events"><ArrowUpRight className="h-4 w-4" /> Browse events</Link>
                </>
              ) : (
                <Link className="btn btn-primary" href="/events"><ArrowUpRight className="h-4 w-4" /> Join an event</Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
