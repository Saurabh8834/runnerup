"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "../../components/app-shell";
import { getApiUrl, readApiError } from "../../../lib/api";
import { Award, Download, Printer, Trophy, ArrowLeft, Share2, CheckCircle2 } from "lucide-react";

type BibData = {
  runnerName: string;
  bibNumber: string;
  distance: string;
  eventTitle: string;
  rankNumber?: string;
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
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

        // Verify payment status: digital bib is strictly available only for paid users
        if (payload.isPaid === false) {
          throw new Error("Payment pending. Official digital race bib and finisher certificate are available exclusively for confirmed, paid participants.");
        }

        // Determine 4-digit rank or bib number (e.g. 0001)
        const certItem = payload.prizes?.find((p: any) => p.type === "certificate");
        const certHref = certItem?.action?.href ?? "";
        const certNum = certHref.startsWith("/certificates/")
          ? certHref.replace("/certificates/", "")
          : null;

        // Normalize distance: e.g. "5 km" -> "5 KM"
        const distStr = (payload.event?.distance || "5 KM").toUpperCase();

        // 4-digit display number: if user is #1 or has bib like 10001, map cleanly
        let fourDigit = "0001";
        const cleanDigits = (payload.runner?.bibNumber || bibNumber).replace(/\D/g, "");
        if (cleanDigits) {
          const num = parseInt(cleanDigits, 10);
          if (num === 10001 || num === 1) {
            fourDigit = "0001";
          } else if (num > 10000 && num <= 10999) {
            fourDigit = String(num - 10000).padStart(4, "0");
          } else {
            fourDigit = String(num % 10000).padStart(4, "0");
          }
        }

        setData({
          runnerName: (payload.runner?.name || "RUNNER").toUpperCase(),
          bibNumber: payload.runner?.bibNumber || bibNumber,
          distance: distStr,
          eventTitle: payload.event?.title || "Indian Air Force Day Challenge",
          rankNumber: fourDigit,
          certificateNumber: certNum,
        });

        // Non-blocking telemetry
        try {
          fetch(getApiUrl("/api/track/download"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "BIB", identifier: payload.runner?.bibNumber || bibNumber }),
            keepalive: true,
          }).catch(() => {});
        } catch {}
      } catch (err: any) {
        setError(err.message || "Failed to load bib.");
      } finally {
        setLoading(false);
      }
    }

    fetchBib();
  }, [bibNumber]);

  // High-Resolution Canvas Renderer & Downloader
  const handleDownloadImage = () => {
    if (!data) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 675;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/iaf-bib-base.jpg";

    img.onload = () => {
      // 1. Draw base image
      ctx.drawImage(img, 0, 0, 1200, 675);

      // 2. Clean slanted bib center polygon (x: 140..1120, y: 175..365)
      ctx.fillStyle = "#fdfdfd";
      ctx.beginPath();
      ctx.moveTo(140, 175);
      ctx.lineTo(1120, 175);
      ctx.lineTo(1060, 365);
      ctx.lineTo(50, 365);
      ctx.closePath();
      ctx.fill();

      // 3. Category header (e.g. 5 KM)
      ctx.fillStyle = "#874f41";
      ctx.font = "900 32px 'Arial Black', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "6px";
      ctx.fillText(data.distance, 600, 215);

      // 4. 4-digit number (e.g. 0001) in Arial Black
      ctx.fillStyle = "#001834";
      ctx.font = "900 135px 'Arial Black', Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "10px";
      ctx.fillText(data.rankNumber || "0001", 600, 340);

      // 5. Clean runner ribbon (x: 230..970, y: 395..465)
      ctx.fillStyle = "#001026";
      ctx.fillRect(230, 395, 740, 70);

      // 6. Runner Name in ALL CAPS
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 38px 'Arial Black', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "6px";
      ctx.fillText(data.runnerName, 600, 446);

      // 7. Trigger instant download
      const a = document.createElement("a");
      a.download = `IAF_Bib_${data.bibNumber}_${data.runnerName.replace(/\s+/g, "_")}.jpg`;
      a.href = canvas.toDataURL("image/jpeg", 0.95);
      a.click();

      try {
        fetch(getApiUrl("/api/track/download"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "BIB", identifier: data.bibNumber }),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    };
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Official IAF Race Bib: ${data?.bibNumber}`,
          text: `Check out my official race bib #${data?.rankNumber} (${data?.distance}) for the Indian Air Force Day Challenge on RunnerUp!`,
          url: window.location.href,
        });
      } catch {
        // Fallback to copy
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <PageShell>
      <section className="py-8 sm:py-14 bg-[#0d161a] text-[#fbe9d0] min-h-[85vh]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">

          {/* Navigation Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>

            {data && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleShare}
                  type="button"
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all inline-flex items-center gap-1.5 shadow"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {copied ? "Copied Link!" : "Share Bib"}
                </button>

                <button
                  onClick={() => window.print()}
                  type="button"
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all inline-flex items-center gap-1.5 shadow"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>

                <button
                  onClick={handleDownloadImage}
                  type="button"
                  className="neon-btn-blue rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Download Bib (HD)
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-3xl border border-white/10 bg-black/40 p-16 text-center shadow-2xl">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#e64833] border-t-transparent mb-4" />
              <p className="text-sm font-semibold text-slate-300">Generating your official digital bib...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-10 text-center shadow-2xl">
              <p className="text-base font-bold text-rose-300">{error}</p>
              <p className="text-xs text-slate-400 mt-2">Please check the bib number or go back to your dashboard.</p>
              <Link href="/dashboard" className="neon-btn-blue mt-5 inline-flex rounded-full px-6 py-2.5 text-xs font-bold uppercase text-[#fbe9d0]">
                Return to Dashboard
              </Link>
            </div>
          )}

          {/* ══════ LIVE DIGITAL BIB DISPLAY ══════ */}
          {data && (
            <div className="space-y-6">
              {/* Outer Bib Container with Realistic Border and Shadows */}
              <div
                id="bib-print-area"
                className="relative overflow-hidden rounded-3xl border-2 border-slate-700/60 bg-[#001026] shadow-2xl transition-all"
                style={{ aspectRatio: "16 / 9" }}
              >
                {/* Background Base Template */}
                <img
                  src="/iaf-bib-base.jpg"
                  alt="Official Indian Air Force Day Bib"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Overlaid Slanted Clean White Center Plate */}
                <div
                  className="absolute left-[5%] right-[5%] top-[25%] bottom-[43%] bg-[#fdfdfd] shadow-inner flex flex-col items-center justify-center"
                  style={{
                    clipPath: "polygon(7% 0%, 100% 0%, 93% 100%, 0% 100%)",
                  }}
                >
                  {/* Category Pill / Header */}
                  <div className="mb-0.5 sm:mb-1">
                    <span className="font-mono font-black text-[0.65rem] sm:text-base lg:text-xl uppercase tracking-[0.25em] text-[#874f41]">
                      {data.distance}
                    </span>
                  </div>

                  {/* 4-Digit Bib / Position Number */}
                  <p
                    className="font-black text-4xl sm:text-7xl lg:text-9xl text-[#001834] tracking-[0.06em] leading-none select-none"
                    style={{
                      fontFamily: "'Arial Black', Impact, sans-serif",
                    }}
                  >
                    {data.rankNumber || "0001"}
                  </p>
                </div>

                {/* Bottom Navy Ribbon: Runner Name in ALL CAPS */}
                <div
                  className="absolute left-[18%] right-[18%] bottom-[16%] h-[12%] sm:h-[13%] bg-[#001026] flex items-center justify-center shadow-lg"
                  style={{
                    clipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)",
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <p
                    className="font-black text-xs sm:text-xl lg:text-2xl text-white tracking-[0.2em] uppercase truncate px-4"
                    style={{
                      fontFamily: "'Arial Black', Arial, sans-serif",
                      textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {data.runnerName}
                  </p>
                </div>
              </div>

              {/* Action Ribbon below Bib */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl print:hidden">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">Official IAF Digital Finisher Bib</p>
                    <p className="text-[11px] text-slate-300 font-mono">Bib #{data.bibNumber} · {data.distance}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {data.certificateNumber && (
                    <Link
                      href={`/certificates/${data.certificateNumber}`}
                      className="neon-btn-blue rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-md inline-flex items-center gap-1.5"
                    >
                      <Award className="h-3.5 w-3.5" /> Finisher Certificate
                    </Link>
                  )}

                  <Link
                    href={`/leaderboard?distance=${encodeURIComponent(data.distance)}`}
                    className="rounded-full border border-white/20 bg-white/[0.08] hover:bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 transition-all inline-flex items-center gap-1.5 shadow"
                  >
                    <Trophy className="h-3.5 w-3.5 text-amber-400" /> Leaderboard
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * { visibility: hidden !important; }
            #bib-print-area, #bib-print-area * { visibility: visible !important; }
            #bib-print-area {
              position: fixed !important;
              inset: 0 !important;
              width: 100% !important;
              height: auto !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              margin: auto !important;
            }
            header, footer, nav, .print\\:hidden { display: none !important; }
          }
        `,
      }} />
    </PageShell>
  );
}
