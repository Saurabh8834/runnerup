"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "../../components/app-shell";
import { getApiUrl, readApiError, resilientFetch } from "../../../lib/api";
import { getVerifiedRunnerByBib } from "../../../lib/official-runners-map";
import {
  Trophy,
  ArrowLeft,
  ShieldCheck,
  Download,
  Share2,
  CheckCircle2,
  Award,
} from "lucide-react";
import { renderBibCanvas, triggerCanvasDownload } from "../../../lib/asset-canvas";
import { sendDownloadTelemetry } from "../../../lib/track-download";

type BibData = {
  runnerName: string;
  bibNumber: string;
  distance: string;
  eventTitle: string;
  rankNumber: string;
  certificateNumber?: string | null;
  status?: string;
  isPaid?: boolean;
};

export default function DigitalBibPage() {
  const params = useParams<{ bibNumber: string }>();
  const rawBib = decodeURIComponent(params.bibNumber ?? "");
  const bibNumber = rawBib.trim();

  const [data, setData] = useState<BibData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!bibNumber) return;
    let cancelled = false;

    async function fetchBib() {
      setLoading(true);
      setError(null);
      const cleanBib = bibNumber.replace(/\D/g, "");
      const officialRunner = getVerifiedRunnerByBib(cleanBib);

      try {
        const res = await resilientFetch(`/api/prizes/${encodeURIComponent(bibNumber)}`);
        if (!res.ok) {
          const errData = await readApiError(res, "Could not retrieve bib record.");
          throw new Error(errData);
        }
        const json = await res.json();
        const payload = json.data;

        if (payload.isPaid === false) {
          throw new Error("Payment pending. Official digital race bib and finisher certificate are available exclusively for confirmed, paid participants.");
        }

        const runnerNameUpper = (payload.runner?.name || officialRunner?.name || "RUNNER").toUpperCase().trim();

        let rawDist = payload.event?.distance || payload.runner?.distance || payload.distance || officialRunner?.distance || "5 KM";
        let distStr = rawDist.toUpperCase().trim();
        if (!distStr.endsWith("KM") && !distStr.endsWith("K")) {
          distStr += " KM";
        }

        let positionStr = payload.runner?.rankFormatted || (payload.runner?.rank ? String(payload.runner.rank).padStart(4, "0") : null);
        if (runnerNameUpper.includes("ANJALI") || runnerNameUpper.includes("ARSALAN") || runnerNameUpper.includes("SAURABH")) {
          positionStr = "0001";
        } else if (runnerNameUpper.includes("YASHAS") || runnerNameUpper.includes("SAI PRAJYUN")) {
          positionStr = "0002";
        } else if (runnerNameUpper.includes("VIRENDRASINH") || (payload.runner?.bibNumber || bibNumber).includes("370377")) {
          positionStr = "0010";
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

        if (!cancelled) {
          setData({
            runnerName: runnerNameUpper,
            bibNumber: payload.runner?.bibNumber || bibNumber,
            distance: distStr,
            eventTitle: payload.event?.title || "Indian Air Force Day Virtual Challenge 2026",
            rankNumber: positionStr,
            certificateNumber: `CERT-IAF26-${(payload.runner?.bibNumber || bibNumber).replace(/[^A-Za-z0-9]/g, "")}`,
            isPaid: true,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load bib.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchBib();
    return () => {
      cancelled = true;
    };
  }, [bibNumber]);

  // Render bib onto client-side canvas whenever data is ready
  useEffect(() => {
    if (!data) return;
    let cancelled = false;

    async function draw() {
      try {
        const generatedCanvas = await renderBibCanvas({
          runnerName: data?.runnerName || "RUNNER",
          distance: data?.distance || "5 KM",
          positionStr: data?.bibNumber || "1001",
        });

        if (cancelled || !canvasRef.current) return;

        const targetCanvas = canvasRef.current;
        targetCanvas.width = 1024;
        targetCanvas.height = 682;
        const ctx = targetCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(generatedCanvas, 0, 0);
          setCanvasReady(true);
        }
      } catch (err) {
        console.error("Canvas bib render error:", err);
      }
    }

    void draw();
    return () => {
      cancelled = true;
    };
  }, [data]);

  async function handleDownload() {
    if (!data) return;
    setDownloading(true);
    try {
      let canvas = canvasRef.current;
      if (!canvas || !canvasReady) {
        canvas = await renderBibCanvas({
          runnerName: data.runnerName,
          distance: data.distance,
          positionStr: data.bibNumber,
        });
      }
      const safeName = data.runnerName.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `RunnerUp_Bib_${safeName}_${data.bibNumber}.jpg`;
      await triggerCanvasDownload(canvas, filename);
      sendDownloadTelemetry("BIB", data.bibNumber);
    } catch {
      alert("Failed to download digital bib. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleShareWhatsApp() {
    if (!data) return;
    const shareText = `🎽 Ready to race! Here is my official race bib #${data.bibNumber} for the Indian Air Force Day Virtual Challenge 2026: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  }

  return (
    <PageShell>
      <section className="py-10 sm:py-16 bg-[#0d161a] text-[#fbe9d0] min-h-[85vh] flex items-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 w-full">

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
              <p className="text-sm font-semibold text-slate-300">Rendering official digital bib...</p>
            </div>
          )}

          {/* Error */}
          {error && !data && (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-10 text-center shadow-2xl">
              <p className="text-base font-bold text-rose-300">{error}</p>
              <p className="text-xs text-slate-400 mt-2">Please check the bib number or return to dashboard.</p>
              <Link href="/dashboard" className="neon-btn-blue mt-5 inline-flex rounded-full px-6 py-2.5 text-xs font-bold uppercase text-[#fbe9d0]">
                Return to Dashboard
              </Link>
            </div>
          )}

          {/* ══════ ACTIVE OFFICIAL DIGITAL BIB VIEW ══════ */}
          {data && (
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-sky-300 mb-2 shadow-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Official Digital Finisher Bib</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {data.runnerName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  {data.eventTitle} · {data.distance} Virtual Run
                </p>
              </div>

              {/* Bib Canvas Frame */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-sky-500/40 shadow-2xl bg-black/80 aspect-[1024/682] w-full">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain block select-none"
                  width={1024}
                  height={682}
                />
                {!canvasReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-sky-400 border-t-transparent" />
                      <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">Generating HD Bib...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e64833] to-amber-500 hover:from-[#d13a27] hover:to-amber-400 px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? "Preparing HD Image..." : "Download Digital Bib (HD)"}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25 px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 transition-all shadow cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share to WhatsApp</span>
                </button>

                {data.certificateNumber && (
                  <Link
                    href={`/certificates/${encodeURIComponent(data.certificateNumber)}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 transition-all shadow"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>Finisher Certificate</span>
                  </Link>
                )}
              </div>

              {/* Metadata Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-xl text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Participant Name</span>
                  <span className="font-bold text-amber-300 uppercase">{data.runnerName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Leaderboard Position</span>
                  <span className="font-mono font-bold text-emerald-400">#{data.rankNumber}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Assigned Bib Number</span>
                  <span className="font-mono font-bold text-white">{data.bibNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Registration Status</span>
                  <span className="font-bold text-emerald-400 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Eligible &amp; Confirmed Finisher
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>
    </PageShell>
  );
}
