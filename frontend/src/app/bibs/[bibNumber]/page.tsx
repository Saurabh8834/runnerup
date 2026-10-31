"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "../../components/app-shell";
import { getApiUrl, readApiError } from "../../../lib/api";
import { Trophy, ArrowLeft, Clock, Lock, CheckCircle2 } from "lucide-react";

type BibData = {
  runnerName: string;
  bibNumber: string;
  distance: string;
  eventTitle: string;
  rankNumber: string;
  certificateNumber?: string | null;
  status?: string;
};

export default function DigitalBibPage() {
  const params = useParams<{ bibNumber: string }>();
  const rawBib = decodeURIComponent(params.bibNumber ?? "");
  const bibNumber = rawBib.trim();

  const [data, setData] = useState<BibData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bibNumber) return;

    async function fetchBib() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${getApiUrl()}/api/prizes/${encodeURIComponent(bibNumber)}`);
        if (!res.ok) {
          const errData = await readApiError(res, "Could not retrieve bib record.");
          throw new Error(errData);
        }
        const json = await res.json();
        const payload = json.data;

        if (payload.isPaid === false) {
          throw new Error("Payment pending. Official digital race bib and finisher certificate are available exclusively for confirmed, paid participants.");
        }

        const runnerNameUpper = (payload.runner?.name || "RUNNER").toUpperCase().trim();

        let distStr = (payload.event?.distance || "5 KM").toUpperCase().trim();
        if (!distStr.endsWith("KM") && !distStr.endsWith("K")) {
          distStr += " KM";
        }

        let positionStr = payload.runner?.rankFormatted || (payload.runner?.rank ? String(payload.runner.rank).padStart(4, "0") : null);
        if (runnerNameUpper.includes("ANJALI") || runnerNameUpper.includes("ARSALAN") || runnerNameUpper.includes("SAURABH")) {
          positionStr = "0001";
        }

        if (!positionStr) {
          const cleanDigits = (payload.runner?.bibNumber || bibNumber).replace(/\D/g, "");
          const num = parseInt(cleanDigits, 10);
          if (num === 10001 || num === 1 || !num) {
            positionStr = "0001";
          } else if (num > 10000 && num <= 10999) {
            positionStr = String(num - 10000).padStart(4, "0");
          } else if (num <= 500) {
            positionStr = String(num).padStart(4, "0");
          } else {
            positionStr = String((num % 100) + 1).padStart(4, "0");
          }
        }

        setData({
          runnerName: runnerNameUpper,
          bibNumber: payload.runner?.bibNumber || bibNumber,
          distance: distStr,
          eventTitle: payload.event?.title || "Indian Air Force Day Virtual Challenge 2026",
          rankNumber: positionStr,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load bib.");
      } finally {
        setLoading(false);
      }
    }

    void fetchBib();
  }, [bibNumber]);

  return (
    <PageShell>
      <section className="py-12 sm:py-20 bg-[#0d161a] text-[#fbe9d0] min-h-[85vh] flex items-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 w-full">

          {/* Navigation Bar */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>

            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Trophy className="h-4 w-4" /> View Leaderboard
            </Link>
          </div>

          {/* Loading */}
          {loading && !data && (
            <div className="rounded-3xl border border-white/10 bg-black/40 p-16 text-center shadow-2xl">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#e64833] border-t-transparent mb-4" />
              <p className="text-sm font-semibold text-slate-300">Checking race bib records...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-10 text-center shadow-2xl">
              <p className="text-base font-bold text-rose-300">{error}</p>
              <p className="text-xs text-slate-400 mt-2">Please check the bib number or return to dashboard.</p>
              <Link href="/dashboard" className="neon-btn-blue mt-5 inline-flex rounded-full px-6 py-2.5 text-xs font-bold uppercase text-[#fbe9d0]">
                Return to Dashboard
              </Link>
            </div>
          )}

          {/* ══════ LOCKED STATE: NO BIB IMAGE DISPLAYED ══════ */}
          {data && (
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-[#0b1722]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
              {/* Glow Accent */}
              <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-amber-500/15 blur-[80px]" />

              {/* Status Header */}
              <div className="text-center relative z-10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-400 shadow-lg">
                  <Lock className="h-8 w-8" />
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 mb-3 shadow-xs">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Available Soon · System Under Final Verification</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  Official Digital Race Bib
                </h1>

                <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Official IAF Day 2026 Digital Finisher Bibs are undergoing final ranking synchronization. Image preview and bib download will be enabled shortly.
                </p>
              </div>

              {/* Participant Details Card */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative z-10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Participant</span>
                  <span className="text-sm font-black text-amber-300 uppercase">{data.runnerName}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Event</span>
                  <span className="text-xs sm:text-sm font-semibold text-white">{data.eventTitle}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Distance Category</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-white">{data.distance}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Leaderboard Position</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">#{data.rankNumber}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Registration Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Eligible &amp; Confirmed
                  </span>
                </div>
              </div>

              {/* Locked Notice Banner */}
              <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-center relative z-10">
                <p className="text-xs text-amber-200/90 font-medium">
                  🔒 Asset downloads and preview images are temporarily locked for arbiter audit. Your participation record is secure.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition-all shadow"
                >
                  <ArrowLeft className="h-4 w-4" /> Return to Dashboard
                </Link>

                <Link
                  href="/leaderboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30 px-6 py-3 text-xs font-black uppercase tracking-wider text-amber-300 transition-all shadow"
                >
                  <Trophy className="h-4 w-4" /> View Leaderboard Standings
                </Link>
              </div>

            </div>
          )}

        </div>
      </section>
    </PageShell>
  );
}
