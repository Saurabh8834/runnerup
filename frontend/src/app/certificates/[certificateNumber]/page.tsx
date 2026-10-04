"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "../../components/app-shell";
import { getApiUrl, readApiError } from "../../../lib/api";

type CertificateData = {
  certificateNumber: string;
  status: string;
  runnerName: string;
  event: string;
  distance: string;
  bibNumber: string;
  finishTimeSeconds?: number | null;
  issuedAt: string | null;
  pdfUrl?: string | null;
  verified?: boolean;
};

function formatFinishTime(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatIssuedAt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Inline SVG Icons matching the reference certificate ── */

function TricolorRibbon() {
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6 C15 2, 35 12, 58 6 L58 10 C35 16, 15 6, 2 10 Z" fill="#FF9933" />
      <path d="M2 10 C15 6, 35 16, 58 10 L58 14 C35 20, 15 10, 2 14 Z" fill="#FFFFFF" />
      <path d="M2 14 C15 10, 35 20, 58 14 L58 18 C35 24, 15 14, 2 18 Z" fill="#138808" />
      <circle cx="30" cy="12" r="3" stroke="#000088" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function RunnerUpCrestLogo() {
  return (
    <div className="flex flex-col items-center text-center">
      <svg width="64" height="42" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Mountain range background */}
        <path d="M4 36 L22 12 L34 26 L44 10 L60 36 Z" fill="#244855" opacity="0.15" />
        <path d="M8 36 L26 16 L38 28 L48 14 L56 36 Z" fill="#244855" opacity="0.3" />
        <path d="M12 36 L28 18 L38 30 L46 18 L52 36 Z" fill="#244855" />
        {/* Sun behind peaks */}
        <circle cx="46" cy="14" r="5" fill="#e64833" />
        {/* Runner silhouette in foreground */}
        <circle cx="28" cy="14" r="2.5" fill="#e64833" />
        <path d="M28 17.5 L29 24 L32 23 M29 20 L25 22 M29 24 L27 30 M29 24 L32 29" stroke="#e64833" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-display text-sm sm:text-base font-black uppercase tracking-[0.18em] text-[#244855] leading-none mt-1">
        RUNNER<span className="text-[#e64833]">UP</span>
      </p>
      <p className="text-[0.55rem] font-bold uppercase tracking-[0.25em] text-[#874f41] mt-0.5">
        — RUN ANYWHERE, ANYTIME —
      </p>
    </div>
  );
}

function RunnerTrailGraphic() {
  return (
    <svg
      viewBox="0 0 240 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute -left-4 bottom-0 h-[85%] w-auto max-w-[240px] pointer-events-none select-none opacity-20 lg:opacity-30 mix-blend-multiply"
      aria-hidden="true"
    >
      {/* Mountain slopes */}
      <path d="M0 380 L0 180 Q60 220 120 280 L180 340 L240 380 Z" fill="#244855" />
      <path d="M0 380 L0 260 Q80 280 140 340 L180 380 Z" fill="#172c34" />
      {/* Evergreen pine trees along ridge */}
      <polygon points="40,220 34,240 46,240" fill="#244855" />
      <polygon points="60,240 54,260 66,260" fill="#244855" />
      <polygon points="80,265 74,285 86,285" fill="#244855" />
      {/* Trail runner athlete ascending */}
      <g transform="translate(60, 110) scale(1.1)">
        <ellipse cx="40" cy="12" rx="6" ry="6" fill="#244855" />
        <path d="M40 18 Q35 30 30 40 L20 34 L12 48 L22 52 L26 42 L32 46 L28 64 L16 80 L26 84 L38 68 L44 82 L54 78 L42 60 L46 44 L54 50 L60 40 L48 32 L44 18 Z" fill="#244855" />
      </g>
    </svg>
  );
}

function VirtualRunBadge() {
  return (
    <div className="relative inline-flex items-center">
      {/* Tricolor corner slash */}
      <div className="absolute -top-8 -left-8 w-24 h-24 pointer-events-none opacity-60">
        <div className="w-full h-3 bg-[#FF9933] rotate-[-45deg] origin-bottom-right mb-1" />
        <div className="w-full h-3 bg-white rotate-[-45deg] origin-bottom-right mb-1" />
        <div className="w-full h-3 bg-[#138808] rotate-[-45deg] origin-bottom-right" />
      </div>
      <div
        className="relative z-10 rounded-full p-1 shadow-md"
        style={{ background: "linear-gradient(135deg, #244855, #172c34)", border: "2px solid #e64833" }}
      >
        <div className="rounded-full border border-white/30 px-3 py-2 text-center">
          <p className="text-[0.55rem] font-black uppercase tracking-wider text-[#FF9933] leading-none">VIRTUAL</p>
          <p className="text-[0.5rem] font-extrabold uppercase tracking-wider text-white leading-tight">RUN</p>
          <p className="text-[0.45rem] font-bold uppercase tracking-wider text-white/90 leading-none">EVENT</p>
          <p className="text-[0.55rem] text-[#fbe9d0] leading-none mt-0.5">★</p>
        </div>
      </div>
    </div>
  );
}

export default function CertificateVerifyPage() {
  const params = useParams<{ certificateNumber: string }>();
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          getApiUrl(`/api/certificates/verify/${encodeURIComponent(params.certificateNumber)}`),
        );
        if (!response.ok) throw new Error(await readApiError(response, "Certificate not found"));
        const json = await response.json();
        if (!cancelled) setData(json.data as CertificateData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not verify certificate");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.certificateNumber]);

  return (
    <PageShell>
      <section className="section py-8">
        <div className="container-page max-w-5xl">
          {/* Header controls (hidden on print) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <div>
              <p className="eyebrow text-[#e64833]">Official E-Certificate</p>
              <h1 className="heading text-2xl sm:text-3xl mt-1">Certificate of Achievement</h1>
              <p className="lede text-xs sm:text-sm mt-1">Verified RunnerUp finisher credential.</p>
            </div>
            {data && (
              <div className="flex gap-2">
                <button
                  className="btn btn-primary gap-2 shadow-lg"
                  onClick={() => window.print()}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                  Print / Save PDF
                </button>
              </div>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="card p-14 text-center">
              <div className="inline-block h-8 w-8 border-3 border-[#e64833] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-(--muted)">Loading verified certificate…</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-base font-semibold text-(--danger)">{error}</p>
              <p className="text-xs text-(--muted) mt-1">Please verify the certificate URL or contact RunnerUp support.</p>
              <Link className="btn btn-secondary mt-5" href="/">Back to Home</Link>
            </div>
          )}

          {/* ══════ MAIN CERTIFICATE CANVAS (MATCHING USER'S IMAGE) ══════ */}
          {data && (
            <article
              id="certificate-print"
              className="relative overflow-hidden rounded-2xl shadow-2xl transition-all"
              style={{
                background: "linear-gradient(135deg, #fbf6ee 0%, #fcfaf5 45%, #f4ede1 100%)",
                border: "2.5px solid #244855",
                color: "#244855",
              }}
            >
              {/* Subtle Topo contour lines watermark */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{
                  backgroundImage: `radial-gradient(#244855 1px, transparent 1px), radial-gradient(#e64833 1px, #fbf6ee 1px)`,
                  backgroundSize: "28px 28px",
                  backgroundPosition: "0 0, 14px 14px",
                }}
              />

              {/* Top Indian Tricolor Strip */}
              <div className="flex h-2 w-full">
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#138808]" />
              </div>

              {/* Left Trail Runner & Mountain Silhouette Graphic */}
              <RunnerTrailGraphic />

              <div className="relative px-6 py-8 sm:px-12 sm:py-10">

                {/* ── TOP BAR: Left Badge | Center Logo | Right Event Banner ── */}
                <div className="flex items-start justify-between gap-4">
                  {/* Left Badge */}
                  <div className="w-1/4">
                    <VirtualRunBadge />
                  </div>

                  {/* Center RunnerUp Crest Logo */}
                  <div className="w-2/4 flex justify-center">
                    <RunnerUpCrestLogo />
                  </div>

                  {/* Right Event Header + Ribbon */}
                  <div className="w-1/4 flex flex-col items-end text-right">
                    <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-[#e64833] leading-none">
                      — EVENT —
                    </p>
                    <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#244855] leading-tight mt-0.5">
                      {data.event}
                    </p>
                    <div className="mt-1">
                      <TricolorRibbon />
                    </div>
                  </div>
                </div>

                {/* ── CERTIFICATE OF ACHIEVEMENT TITLE ── */}
                <div className="mt-6 text-center">
                  <h2
                    className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#244855] leading-none"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.01em" }}
                  >
                    CERTIFICATE
                  </h2>
                  <div className="flex items-center justify-center gap-3 mt-1.5">
                    <span className="h-0.5 w-12 sm:w-16 bg-[#e64833]" />
                    <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] text-[#e64833]">
                      OF ACHIEVEMENT ★
                    </p>
                    <span className="h-0.5 w-12 sm:w-16 bg-[#e64833]" />
                  </div>
                </div>

                {/* ── RECIPIENT NAME & DISTANCE ── */}
                <div className="mt-6 text-center">
                  <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.25em] text-[#874f41]">
                    THIS CERTIFICATE IS PROUDLY PRESENTED TO
                  </p>

                  <div className="my-2 sm:my-3 inline-block">
                    <div
                      className="px-8 sm:px-14 py-2"
                      style={{
                        borderTop: "2px solid #e64833",
                        borderBottom: "2px solid #e64833",
                      }}
                    >
                      <p
                        className="text-4xl sm:text-5xl lg:text-6xl text-[#244855] font-bold"
                        style={{
                          fontFamily: "'Dancing Script', 'Brush Script MT', 'Segoe Script', cursive",
                          lineHeight: 1.25,
                          textShadow: "0 1px 2px rgba(0,0,0,0.06)",
                        }}
                      >
                        {data.runnerName}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#244855]/90">
                    for successfully completing the{" "}
                    <strong className="text-[#244855] font-black text-base sm:text-lg">
                      [ {data.distance} ]
                    </strong>{" "}
                    Virtual Run
                  </p>
                </div>

                {/* ── 4-COLUMN STATS CARD (MATCHING REFERENCE IMAGE) ── */}
                <div className="mt-8 rounded-xl border-2 border-[#90aead]/30 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#90aead]/30">
                    {/* Distance */}
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="text-xl sm:text-2xl mb-1">🛣️</div>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#874f41]">DISTANCE</p>
                      <p className="text-base sm:text-lg font-black text-[#244855] mt-0.5">[ {data.distance} ]</p>
                      <p className="text-[0.6rem] text-[#874f41] mt-0.5">(Category: {data.distance})</p>
                    </div>

                    {/* Completion Time */}
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="text-xl sm:text-2xl mb-1">⏱️</div>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#874f41]">COMPLETION TIME</p>
                      <p className="text-base sm:text-lg font-black text-[#244855] mt-0.5">
                        [ {formatFinishTime(data.finishTimeSeconds)} ]
                      </p>
                      <p className="text-[0.6rem] text-[#874f41] mt-0.5">(Verified Finish)</p>
                    </div>

                    {/* Activity Date */}
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="text-xl sm:text-2xl mb-1">📅</div>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#874f41]">ACTIVITY DATE</p>
                      <p className="text-base sm:text-lg font-black text-[#244855] mt-0.5">
                        [ {formatIssuedAt(data.issuedAt)} ]
                      </p>
                      <p className="text-[0.6rem] text-[#874f41] mt-0.5">(Verified Date)</p>
                    </div>

                    {/* Event */}
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="text-xl sm:text-2xl mb-1">🏅</div>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#874f41]">EVENT</p>
                      <p className="text-xs sm:text-sm font-black text-[#e64833] uppercase mt-0.5 leading-tight">
                        {data.event}
                      </p>
                      <p className="text-[0.6rem] text-[#874f41] mt-0.5">Bib: #{data.bibNumber}</p>
                    </div>
                  </div>
                </div>

                {/* ── BOTTOM SIGNATURES, SEALS & QR CODE ── */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 items-end gap-6 text-center">
                  {/* Left: Organizer Signature */}
                  <div className="flex flex-col items-center">
                    <p
                      className="text-2xl sm:text-3xl text-[#244855] font-bold"
                      style={{ fontFamily: "'Dancing Script', cursive" }}
                    >
                      Mountain Run Team
                    </p>
                    <div className="h-0.5 w-32 bg-[#e64833] my-1" />
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.15em] text-[#244855]">
                      MOUNTAIN RUN TEAM
                    </p>
                    <p className="text-[0.55rem] text-[#874f41]">Organizer</p>
                  </div>

                  {/* Center-Left: Official Wax / Stamp Seal */}
                  <div className="flex flex-col items-center">
                    <div className="w-18 h-18 rounded-full bg-[#244855] border-2 border-dashed border-[#e64833] flex flex-col items-center justify-center p-2 shadow-md">
                      <p className="text-[0.5rem] font-black uppercase tracking-wider text-[#fbe9d0] leading-none">MOUNTAIN RUN</p>
                      <p className="text-[0.45rem] font-bold tracking-wider text-[#fbe9d0] uppercase mt-0.5">RUN ANYWHERE</p>
                      <p className="text-[0.4rem] tracking-widest text-[#90aead] uppercase">ANYTIME</p>
                      <p className="text-[0.65rem] text-[#e64833] leading-none mt-0.5">★★★</p>
                    </div>
                  </div>

                  {/* Center-Right: QR Code */}
                  <div className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&color=244855&bgcolor=fcfaf5&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : data.certificateNumber)}`}
                      alt="Certificate QR"
                      className="w-14 h-14 rounded border border-[#90aead]/40 shadow-xs"
                    />
                    <p className="text-[0.55rem] font-black uppercase tracking-wider text-[#244855] mt-1">
                      VERIFY CERTIFICATE
                    </p>
                    <p className="text-[0.5rem] text-[#874f41]">Scan to Verify</p>
                  </div>

                  {/* Right: Keep Running Signature */}
                  <div className="flex flex-col items-center">
                    <p
                      className="text-2xl sm:text-3xl text-[#244855] font-bold"
                      style={{ fontFamily: "'Dancing Script', cursive" }}
                    >
                      Keep Running
                    </p>
                    <div className="h-0.5 w-32 bg-[#e64833] my-1" />
                    <p className="text-[0.55rem] font-black uppercase tracking-wider text-[#244855]">
                      KEEP RUNNING, KEEP INSPIRING!
                    </p>
                    <p className="text-[0.5rem] text-[#874f41]">Every Finish Has a Story</p>
                  </div>
                </div>

                {/* Verified Pill & Disclaimer */}
                <div className="mt-8 pt-4 border-t border-[#d9cdb0]/60 text-center">
                  <p className="text-[0.55rem] sm:text-[0.6rem] font-bold uppercase tracking-wider text-[#7a6e5a]">
                    THIS IS AN E-CERTIFICATE AND DOES NOT REQUIRE A PHYSICAL SIGNATURE.
                  </p>
                  <p className="text-[0.5rem] font-mono text-[#7a6e5a] mt-1">
                    Cert ID: {data.certificateNumber} · Issued: {formatIssuedAt(data.issuedAt)}
                  </p>
                </div>
              </div>

              {/* Bottom Indian Tricolor Strip */}
              <div className="flex h-2 w-full">
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#138808]" />
              </div>
            </article>
          )}

          {/* Action buttons (hidden on print) */}
          {data && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex gap-2">
                <Link className="btn btn-secondary" href="/dashboard">
                  My Dashboard
                </Link>
                <Link className="btn btn-ghost" href="/leaderboard">
                  View Leaderboard
                </Link>
              </div>
              <p className="text-xs text-(--muted)">
                Need help? Contact support with Certificate ID: <strong className="font-mono text-(--foreground)">{data.certificateNumber}</strong>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Print & Font Styles ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

          @media print {
            @page {
              size: A4 landscape;
              margin: 0.3in;
            }
            body * { visibility: hidden !important; }
            #certificate-print,
            #certificate-print * { visibility: visible !important; }
            #certificate-print {
              position: fixed !important;
              inset: 0 !important;
              width: 100% !important;
              height: 100% !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: visible !important;
              margin: 0 !important;
            }
            header, footer, nav, .print\\:hidden { display: none !important; }
          }
        `,
      }} />
    </PageShell>
  );
}
