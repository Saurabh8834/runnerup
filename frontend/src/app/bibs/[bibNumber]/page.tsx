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
  rankNumber: string;
  certificateNumber?: string | null;
  status?: string;
};

export default function DigitalBibPage() {
  const params = useParams<{ bibNumber: string }>();
  const rawBib = decodeURIComponent(params.bibNumber ?? "");
  const bibNumber = rawBib.trim();

  const [data, setData] = useState<BibData | null>(null);
  const [bibImageUrl, setBibImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

        // Determine certificate href/number
        const certItem = payload.prizes?.find((p: any) => p.type === "certificate");
        const certHref = certItem?.action?.href ?? "";
        const certNum = certHref.startsWith("/certificates/")
          ? certHref.replace("/certificates/", "")
          : null;

        // Distance: e.g. "5 KM"
        let distStr = (payload.event?.distance || "5 KM").toUpperCase().trim();
        if (!distStr.endsWith("KM") && !distStr.endsWith("K")) {
          distStr += " KM";
        }

        // 4-digit display number: rank #1 or 10001 -> 0001
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

        const runnerNameUpper = (payload.runner?.name || "RUNNER").toUpperCase().trim();

        setData({
          runnerName: runnerNameUpper,
          bibNumber: payload.runner?.bibNumber || bibNumber,
          distance: distStr,
          eventTitle: payload.event?.title || "Indian Air Force Day Challenge",
          rankNumber: fourDigit,
          certificateNumber: certNum || ("CERT-IAF26-" + (payload.runner?.bibNumber || bibNumber).replace(/[^A-Za-z0-9]/g, "")),
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

  // Generate 100% Pixel-Perfect Clean Canvas Image when data arrives
  useEffect(() => {
    if (!data) return;

    setRendering(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 682;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/iaf-bib-clean-base.jpg";

    img.onload = () => {
      // 1. Draw 100% Clean Base Template
      ctx.drawImage(img, 0, 0, 1024, 682);

      // 2. Category Header (e.g. "5 KM")
      ctx.fillStyle = "#874f41";
      ctx.font = "900 28px 'Arial Black', Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(data.distance, 512, 270);

      // 3. 4-Digit Bib Number (e.g. "0001" or "0377") in Navy
      ctx.fillStyle = "#001834";
      ctx.font = "900 185px 'Arial Black', Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(data.rankNumber, 512, 420);

      // 4. Runner Name on Bottom Navy Bar (e.g. "——  VIRENDRASINH  ——")
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 22px 'Arial Black', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`——  ${data.runnerName}  ——`, 512, 658);

      const generatedUrl = canvas.toDataURL("image/jpeg", 0.98);
      setBibImageUrl(generatedUrl);
      setRendering(false);
    };

    img.onerror = () => {
      setRendering(false);
    };
  }, [data]);

  // Instant High-Resolution Download
  const handleDownload = () => {
    if (!bibImageUrl || !data) return;

    const a = document.createElement("a");
    a.download = `IAF_Bib_${data.rankNumber}_${data.runnerName.replace(/\s+/g, "_")}.jpg`;
    a.href = bibImageUrl;
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
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all inline-flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {copied ? "Copied Link!" : "Share Bib"}
                </button>

                <button
                  onClick={() => window.print()}
                  type="button"
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all inline-flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!bibImageUrl}
                  type="button"
                  className="neon-btn-blue rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-4 w-4" /> Download Bib (HD)
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {(loading || rendering) && !bibImageUrl && (
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

          {/* ══════ LIVE DIGITAL BIB DISPLAY (PIXEL PERFECT HD IMAGE) ══════ */}
          {bibImageUrl && data && (
            <div className="space-y-6">
              <div
                id="bib-print-area"
                className="relative overflow-hidden rounded-3xl border-2 border-slate-700/60 bg-[#001026] shadow-2xl transition-all"
              >
                <img
                  src={bibImageUrl}
                  alt={`Official IAF Bib #${data.rankNumber} - ${data.runnerName}`}
                  className="w-full h-auto block select-none"
                />
              </div>

              {/* Action Ribbon below Bib */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl print:hidden">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">Official IAF Digital Finisher Bib</p>
                    <p className="text-[11px] text-slate-300 font-mono">Bib #{data.rankNumber} · {data.distance} · {data.runnerName}</p>
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
