"use client";

import { ArrowRight, ArrowUp, Check, CheckCircle2, Flame, Loader2, Mail, Send } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { getApiUrl } from "../../lib/api";

/* ─── Social SVGs ─── */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const socials = [
  { label: "Instagram", href: "https://instagram.com/runnerup.in", icon: <InstagramIcon /> },
  { label: "WhatsApp", href: "https://wa.me/918287831071", icon: <WhatsAppIcon /> },
];

/* ─── Newsletter ─── */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(getApiUrl("/api/subscribers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? "Subscription failed");
      }
      setDone(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, [email]);
  if (done) return (
    <div className="flex items-center gap-2 rounded-xl border border-[#ff4b26]/40 bg-[#ff4b26]/10 px-3 py-2 text-xs font-bold text-white">
      <Check className="h-3.5 w-3.5 shrink-0 text-[#ff4b26]" /> You&rsquo;re subscribed!
    </div>
  );
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" aria-label="Newsletter email"
          className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0d141d] px-3.5 text-xs text-white placeholder:text-slate-400/50 focus:border-[#ff4b26] focus:outline-none focus:ring-2 focus:ring-[#e64833]/20" />
        <button type="submit" disabled={busy} aria-label="Subscribe"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#ff4b26] to-[#e03a16] text-white transition-all shadow-md active:scale-95 disabled:opacity-60 hover:brightness-110">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-xs text-rose-400 font-semibold">{error}</p> : null}
    </form>
  );
}

/* ─── Footer link column ─── */
function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wider text-white">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              prefetch={false}
              className="text-xs font-medium text-slate-400 transition-colors hover:text-[#ff4b26]"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Main ─── */
export function AppFooter() {
  const pathname = usePathname();
  const isEventDetail = pathname?.startsWith("/events/") && pathname !== "/events";
  const isCheckout = pathname === "/register";
  const hidePreFooter = isEventDetail || isCheckout;

  return (
    <footer className="relative mt-auto bg-[#080c10] text-[#f8fafc]">
      {/* ─── Elite Athlete Pre-Footer Conversion Banner (Hidden on event detail where EventCta is present) ─── */}
      {!hidePreFooter && (
        <div className="relative bg-gradient-to-b from-[#0e1622] via-[#080c10] to-[#080c10] pt-5 pb-6 sm:pt-6 sm:pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
          {/* Ambient Stadium Dusk Flare */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-48 w-3/4 max-w-4xl rounded-full bg-gradient-to-b from-[#ff4b26]/20 via-[#ff4b26]/5 to-transparent blur-[80px]"
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-5">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff4b26]/40 bg-[#ff4b26]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#ff4b26] shadow-sm">
              <Flame className="h-3.5 w-3.5 fill-[#ff4b26]" />
              <span>EVERY FINISHER COUNTS • PAN-INDIA RACE SERIES</span>
            </div>

            {/* High-Impact Headline */}
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
              STOP SCROLLING. <span className="text-[#ff4b26] italic">START RUNNING.</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
              Pick your distance, sync with Strava or Garmin, and earn an authentic die-cast 3D metal finisher medal delivered free to your doorstep.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4b26] to-[#e03a16] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(255,75,38,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                <span>Explore Open Challenges</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all"
              >
                <span>How Verification Works</span>
              </Link>
            </div>

            {/* Trust Guarantees Micro-Row */}
            <div className="pt-4 sm:pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Free Doorstep Delivery</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Strava / Garmin / NRC Sync</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Official Verifiable E-Certificate</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main footer body */}
      <div className="bg-[#080c10] border-t border-white/10">
        <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* Grid — 2 cols mobile (2x2 link grid), 6 cols desktop */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-6">

            {/* Brand */}
            <div className="col-span-2 md:col-span-2">
              <Link href="/" aria-label="RUNNERUP home" className="group inline-flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/runnerup-logo.png" alt="RUNNERUP" width={200} height={44}
                  className="h-10 sm:h-11 w-auto shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(230,72,51,0.3)]" />
              </Link>
              <p className="mt-4 text-xs leading-relaxed text-slate-400 max-w-xs font-medium">
                India&apos;s premier virtual running platform. GPS-verified races, custom metal medals, DRI-FIT apparel, and live national leaderboards.
              </p>
              <div className="mt-4 flex items-center gap-2.5">
                {socials.map(({ label, href, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#0d141d] text-white transition-all hover:border-[#ff4b26] hover:bg-[#ff4b26]/15 hover:text-[#ff4b26] shadow-sm">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            <FooterCol title="Races & Events" links={[
              ["What is a Virtual Run?", "/what-is-virtual-run"],
              ["Upcoming Challenges", "/events"],
              ["Runner Photo Wall", "/gallery"],
              ["National Leaderboard", "/leaderboard"],
            ]} />

            <FooterCol title="Athlete Portal" links={[
              ["Athlete Sign In", "/sign-in"],
              ["Register Account", "/sign-up"],
              ["My Dashboard", "/dashboard"],
              ["Submit Run Proof", "/dashboard"],
            ]} />

            <FooterCol title="Rewards & Info" links={[
              ["Prizes & Medals", "/prize"],
              ["Refer a Runner", "/refer"],
              ["About RunnerUp", "/about"],
              ["GPS Verification FAQ", "/#faq"],
            ]} />

            <FooterCol title="Help & Support" links={[
              ["Support Desk", "mailto:runnerupofficials@gmail.com"],
              ["WhatsApp Chat Support", "https://wa.me/918287831071"],
              ["Official Gallery", "/gallery"],
              ["Unsubscribe Alerts", "/unsubscribe"],
            ]} />

          </div>

          {/* Newsletter + Contact row */}
          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 items-center">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-wider text-white">Stay in the Race</p>
                <p className="mt-1 text-xs text-slate-400 font-medium">Get early race drops, medal releases & training guides.</p>
                <div className="mt-3.5 max-w-sm">
                  <NewsletterForm />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end sm:text-right">
              <p className="text-xs font-black uppercase tracking-wider text-white">Support Desk</p>
              <a href="mailto:runnerupofficials@gmail.com" className="flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-[#ff4b26]">
                <Mail className="h-3.5 w-3.5 text-[#ff4b26]" />
                <span>runnerupofficials@gmail.com</span>
              </a>
              <a href="https://wa.me/918287831071" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-[#ff4b26]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-emerald-400"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                <span>+91 82878 31071 (WhatsApp Chat Support)</span>
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/10 pt-6 pb-16 sm:pb-0 sm:flex-row sm:justify-between">
            <p className="text-xs text-slate-400 font-medium">&copy; {new Date().getFullYear()} RUNNERUP India. All rights reserved.</p>
            <p className="hidden text-xs text-slate-400/60 font-medium sm:block">Engineered with ❤️ for runners across India</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} type="button"
              aria-label="Scroll to top"
              className="group flex cursor-pointer items-center gap-1.5 text-xs font-bold text-white transition-all hover:text-[#ff4b26]">
              <span>Back to top</span>
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
