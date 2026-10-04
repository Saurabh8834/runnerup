"use client";

import { ArrowUp, Check, Loader2, Mail, Send } from "lucide-react";
import Link from "next/link";
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
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socials = [
  { label: "Instagram", href: "https://instagram.com/runnerupofficial", icon: <InstagramIcon /> },
  { label: "WhatsApp", href: "https://wa.me/918287491957", icon: <WhatsAppIcon /> },
  { label: "Facebook", href: "https://facebook.com/runnerupofficial", icon: <FacebookIcon /> },
  { label: "X", href: "https://twitter.com/runnerupofficial", icon: <XIcon /> },
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
    <div className="flex items-center gap-2 rounded-xl border border-[#e64833]/40 bg-[#e64833]/10 px-3 py-2 text-xs font-bold text-[#fbe9d0]">
      <Check className="h-3.5 w-3.5 shrink-0 text-[#e64833]" /> You&rsquo;re subscribed!
    </div>
  );
  return (
    <form onSubmit={onSubmit} noValidate className="flex gap-2">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com" aria-label="Newsletter email"
        className="h-10 min-w-0 flex-1 rounded-xl border border-[#90aead]/20 bg-[#172c34] px-3.5 text-xs text-[#fbe9d0] placeholder:text-[#90aead]/50 focus:border-[#e64833] focus:outline-none focus:ring-2 focus:ring-[#e64833]/20" />
      <button type="submit" disabled={busy} aria-label="Subscribe"
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#e64833] to-[#c93b27] text-[#fbe9d0] transition-all shadow-md active:scale-95 disabled:opacity-60 hover:brightness-110">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </button>
      {error ? <p className="text-xs text-rose-400 font-semibold">{error}</p> : null}
    </form>
  );
}

/* ─── Footer link column ─── */
function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wider text-[#fbe9d0]">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href}
              className="text-xs font-medium text-[#90aead] transition-colors hover:text-[#e64833]">
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
  return (
    <footer className="relative mt-auto bg-[#112026] text-[#fbe9d0]">
      {/* ─── Ultra-Premium Alpine Trail Elevation & Mountain Horizon Divider ─── */}
      <div aria-hidden="true" className="relative w-full overflow-hidden leading-none select-none -mb-1 pointer-events-none">
        {/* Ambient Aurora Horizon Glow */}
        <div className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 h-36 w-full max-w-5xl rounded-full bg-gradient-to-t from-[#244855]/40 via-[#90aead]/15 to-transparent blur-[80px]" />
        
        {/* Peak Summit Accent Light */}
        <div className="pointer-events-none absolute top-4 left-[58%] -translate-x-1/2 h-16 w-32 rounded-full bg-[#e64833]/25 blur-[40px]" />

        <svg
          viewBox="0 0 1440 220"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 block w-full h-24 sm:h-36 md:h-44 lg:h-52"
        >
          <defs>
            {/* Sky / Atmospheric Mist Gradient */}
            <linearGradient id="skyAtmosphere" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#90aead" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#244855" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#112026" stopOpacity="0" />
            </linearGradient>

            {/* Distant Alpine Crests */}
            <linearGradient id="crestFar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#90aead" stopOpacity="0.35" />
              <stop offset="30%" stopColor="#244855" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#112026" stopOpacity="0.9" />
            </linearGradient>

            {/* Mid Alpine Range */}
            <linearGradient id="crestMid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#874f41" stopOpacity="0.55" />
              <stop offset="40%" stopColor="#244855" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#112026" stopOpacity="0.98" />
            </linearGradient>

            {/* Foreground Alpine Range */}
            <linearGradient id="crestNear" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#172c34" stopOpacity="1" />
              <stop offset="50%" stopColor="#14242a" stopOpacity="1" />
              <stop offset="100%" stopColor="#112026" stopOpacity="1" />
            </linearGradient>

            {/* Glowing Race Path Trail */}
            <linearGradient id="trailGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e64833" stopOpacity="0.1" />
              <stop offset="15%" stopColor="#e64833" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#fbe9d0" stopOpacity="1" />
              <stop offset="58%" stopColor="#e64833" stopOpacity="0.95" />
              <stop offset="85%" stopColor="#874f41" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#874f41" stopOpacity="0.1" />
            </linearGradient>

            {/* Subtle Topo Grid Pattern */}
            <pattern id="topoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(144,174,173,0.05)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background Topo Atmosphere Grid */}
          <rect width="1440" height="220" fill="url(#skyAtmosphere)" />
          <rect width="1440" height="220" fill="url(#topoGrid)" opacity="0.7" />

          {/* ═══ Layer 1: Distant Jagged Alpine Peaks (Himalayan Range) ═══ */}
          <path
            d="M0 220 L0 120 
               L60 98 L120 115 L180 82 L240 102 L310 65 L370 90 L440 50 L510 85 
               L580 40 L650 78 L720 30 L800 68 L880 25 L960 70 L1040 38 L1120 75 
               L1200 48 L1280 80 L1360 60 L1440 95 L1440 220 Z"
            fill="url(#crestFar)"
          />

          {/* ═══ Layer 2: Mid-Range Rocky Ridges with Snow Highlights ═══ */}
          <path
            d="M0 220 L0 145 
               L80 125 L160 140 L250 105 L330 130 L420 92 L500 120 L600 70 L690 110 
               L780 62 L850 95 L930 55 L1020 98 L1110 68 L1200 108 L1290 80 L1370 115 L1440 100 L1440 220 Z"
            fill="url(#crestMid)"
          />

          {/* ═══ Layer 3: Glowing Trail Marathon Elevation Contour Line ═══ */}
          <path
            d="M0 180 
               C120 170 200 135 320 142 
               C420 148 480 105 590 100 
               C680 96 720 72 830 68 
               C940 64 990 118 1100 112 
               C1220 106 1310 145 1440 135"
            stroke="url(#trailGlow)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="drop-shadow-[0_0_12px_rgba(230,72,51,0.8)]"
          />

          {/* Elevation Checkpoint Pulse Markers (Start, 10K, 21K Summit, Finish) */}
          {/* Checkpoint 1 (10K) */}
          <circle cx="320" cy="142" r="3.5" fill="#90aead" className="drop-shadow-[0_0_8px_rgba(144,174,173,0.9)]" />
          <circle cx="320" cy="142" r="7" stroke="#90aead" strokeWidth="1" opacity="0.5" fill="none" />

          {/* Checkpoint 2 (21K Halfway) */}
          <circle cx="590" cy="100" r="4" fill="#e64833" className="drop-shadow-[0_0_10px_rgba(230,72,51,1)]" />
          <circle cx="590" cy="100" r="8" stroke="#e64833" strokeWidth="1.2" opacity="0.6" fill="none" />

          {/* Checkpoint 3 (Summit 42K Peak Marker) */}
          <circle cx="830" cy="68" r="5" fill="#fbe9d0" className="drop-shadow-[0_0_14px_rgba(251,233,208,1)]" />
          <circle cx="830" cy="68" r="10" stroke="#fbe9d0" strokeWidth="1.5" opacity="0.8" fill="none" />

          {/* Checkpoint 4 (Finish Descent) */}
          <circle cx="1100" cy="112" r="3.5" fill="#90aead" className="drop-shadow-[0_0_8px_rgba(144,174,173,0.9)]" />
          <circle cx="1100" cy="112" r="7" stroke="#90aead" strokeWidth="1" opacity="0.5" fill="none" />

          {/* ═══ Layer 4: Foreground Ridge & Foothills Blending Seamlessly into #112026 ═══ */}
          <path
            d="M0 220 L0 175 
               C100 168 190 152 280 158 
               C380 165 470 138 560 142 
               C660 147 750 120 850 125 
               C960 131 1060 158 1160 150 
               C1260 142 1350 162 1440 155 L1440 220 Z"
            fill="url(#crestNear)"
          />

          {/* ═══ Layer 5: Base Floor Transition ═══ */}
          <path
            d="M0 220 L0 195 
               C240 185 480 198 720 188 
               C960 178 1200 192 1440 185 L1440 220 Z"
            fill="#112026"
          />
        </svg>
      </div>

      {/* Main footer body */}
      <div className="bg-[#112026] border-t border-[#90aead]/15">
        <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* Grid — 2 cols mobile, 4 cols tablet, 5 cols desktop */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-3 md:col-span-2">
              <Link href="/" aria-label="RUNNERUP home" className="group inline-flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/runnerup-logo.png" alt="RUNNERUP" width={200} height={44}
                  className="h-10 sm:h-11 w-auto shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(230,72,51,0.3)]" />
              </Link>
              <p className="mt-4 text-xs leading-relaxed text-[#90aead] max-w-xs font-medium">
                India&apos;s premier virtual running platform. GPS-verified races, custom metal medals, DRI-FIT apparel, and live national leaderboards.
              </p>
              <div className="mt-4 flex items-center gap-2.5">
                {socials.map(({ label, href, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#90aead]/20 bg-[#172c34] text-[#fbe9d0] transition-all hover:border-[#e64833] hover:bg-[#e64833]/15 hover:text-[#e64833] shadow-sm">
                    {icon}
                  </a>
                ))}
                <a href="mailto:runnerupofficial@gmail.com" aria-label="Email"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#90aead]/20 bg-[#172c34] text-[#fbe9d0] transition-all hover:border-[#e64833] hover:bg-[#e64833]/15 hover:text-[#e64833] shadow-sm">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            <FooterCol title="Races & Events" links={[
              ["Upcoming Challenges", "/events"],
              ["Past Race Archive", "/events"],
              ["Runner Photo Wall", "/gallery"],
              ["National Leaderboard", "/leaderboard"],
            ]} />

            <FooterCol title="Help & Support" links={[
              ["Official Gallery", "/gallery"],
              ["Leaderboard Rankings", "/leaderboard"],
              ["GPS Verification FAQ", "/#faq"],
              ["Contact Support", "mailto:runnerupofficial@gmail.com"],
            ]} />

            <FooterCol title="Athlete Portal" links={[
              ["Athlete Sign In", "/sign-in"],
              ["Register Account", "/sign-up"],
              ["My Dashboard", "/dashboard"],
              ["Submit Run Proof", "/dashboard"],
            ]} />

          </div>

          {/* Newsletter + Contact row */}
          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-[#90aead]/15 pt-8 sm:grid-cols-2 items-center">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-wider text-[#fbe9d0]">Stay in the Race</p>
                <p className="mt-1 text-xs text-[#90aead] font-medium">Get early race drops, medal releases & training guides.</p>
                <div className="mt-3.5 max-w-sm">
                  <NewsletterForm />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end sm:text-right">
              <p className="text-xs font-black uppercase tracking-wider text-[#fbe9d0]">Support Desk</p>
              <a href="mailto:runnerupofficial@gmail.com" className="flex items-center gap-2 text-xs font-medium text-[#90aead] transition-colors hover:text-[#e64833]">
                <Mail className="h-3.5 w-3.5 text-[#e64833]" />
                <span>runnerupofficial@gmail.com</span>
              </a>
              <a href="https://wa.me/917518418960" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-medium text-[#90aead] transition-colors hover:text-[#e64833]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-emerald-400"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                <span>+91 7518 418 960</span>
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-[#90aead]/15 pt-6 sm:flex-row sm:justify-between">
            <p className="text-xs text-[#90aead] font-medium">&copy; {new Date().getFullYear()} RUNNERUP India. All rights reserved.</p>
            <p className="hidden text-xs text-[#90aead]/60 font-medium sm:block">Engineered with ❤️ for runners across India</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} type="button"
              aria-label="Scroll to top"
              className="group flex cursor-pointer items-center gap-1.5 text-xs font-bold text-[#fbe9d0] transition-all hover:text-[#e64833]">
              <span>Back to top</span>
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
