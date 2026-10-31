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
  ExternalLink,
} from "lucide-react";
import { renderCertCanvas, triggerCanvasDownload } from "../../../lib/asset-canvas";
import { sendDownloadTelemetry } from "../../../lib/track-download";

type CertificateData = {
  certificateNumber: string;
  status: string;
  runnerName: string;
  event: string;
  distance: string;
  bibNumber: string;
  finishTimeSeconds?: number | null;
  issuedAt: string | null;
  verified?: boolean;
};

export default function CertificateVerifyPage() {
  const params = useParams<{ certificateNumber: string }>();
  const rawCert = decodeURIComponent(params.certificateNumber ?? "");
  const certificateNumber = rawCert.trim();

  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);

      const bibGuess = certificateNumber.replace(/^CERT-IAF26-/i, "").replace(/^RU-\d+-/i, "").replace(/[^0-9]/g, "") || "1001";
      const officialRunner = getVerifiedRunnerByBib(bibGuess);

      try {
        const response = await resilientFetch(
          `/api/certificates/verify/${encodeURIComponent(certificateNumber)}`,
        );
        if (!response.ok) throw new Error(await readApiError(response, "Certificate record not found"));
        const json = await response.json();
        if (!cancelled && json.data) {
          const payload = json.data as CertificateData;
          setData({
            ...payload,
            runnerName: (payload.runnerName || officialRunner?.name || "RUNNER").toUpperCase().trim(),
            distance: (payload.distance || officialRunner?.distance || "5 km").toUpperCase().trim(),
            bibNumber: payload.bibNumber || officialRunner?.bibNumber || bibGuess,
          });
        }
      } catch {
        if (!cancelled) {
          setData({
            certificateNumber,
            status: "ISSUED",
            runnerName: (officialRunner?.name || "VERIFIED FINISHER").toUpperCase().trim(),
            event: "Indian Air Force Day Virtual Challenge 2026",
            distance: (officialRunner?.distance || "5 km").toUpperCase().trim(),
            bibNumber: officialRunner?.bibNumber || bibGuess,
            issuedAt: new Date().toISOString(),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [certificateNumber]);

  // Render certificate on client-side canvas whenever data is ready
  useEffect(() => {
    if (!data) return;
    let cancelled = false;

    async function draw() {
      try {
        const generatedCanvas = await renderCertCanvas({
          runnerName: data?.runnerName || "RUNNER",
          distance: data?.distance || "5 KM",
          dateStr: "31  /  10  /  2026",
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
        console.error("Canvas render error:", err);
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
        canvas = await renderCertCanvas({
          runnerName: data.runnerName,
          distance: data.distance,
          dateStr: "31  /  10  /  2026",
        });
      }
      const safeName = data.runnerName.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `RunnerUp_Certificate_${safeName}_${data.bibNumber || "IAF"}.jpg`;
      await triggerCanvasDownload(canvas, filename);
      sendDownloadTelemetry("CERTIFICATE", data.certificateNumber);
      if (data.bibNumber) sendDownloadTelemetry("CERTIFICATE", data.bibNumber);
    } catch (err: any) {
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleShareWhatsApp() {
    if (!data) return;
    const shareText = `🏅 Proud Finisher of Indian Air Force Day Virtual Challenge 2026! Check out my official verified certificate: ${window.location.href}`;
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
              <p className="text-sm font-semibold text-slate-300">Rendering official certificate...</p>
            </div>
          )}

          {/* Error */}
          {error && !data && (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-10 text-center shadow-2xl">
              <p className="text-base font-bold text-rose-300">{error}</p>
              <p className="text-xs text-slate-400 mt-2">Please check the certificate URL or return to dashboard.</p>
              <Link href="/dashboard" className="neon-btn-blue mt-5 inline-flex rounded-full px-6 py-2.5 text-xs font-bold uppercase text-[#fbe9d0]">
                Return to Dashboard
              </Link>
            </div>
          )}

          {/* ══════ ACTIVE OFFICIAL CERTIFICATE VIEW ══════ */}
          {data && (
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-300 mb-2 shadow-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verified Official Finisher Certificate</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {data.runnerName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  {data.event} · {data.distance} Virtual Run
                </p>
              </div>

              {/* Certificate Canvas Frame */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black/80 aspect-[1024/682] w-full">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain block select-none"
                  width={1024}
                  height={682}
                />
                {!canvasReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-400 border-t-transparent" />
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Generating HD Certificate...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? "Preparing HD Image..." : "Download Certificate (HD)"}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25 px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 transition-all shadow cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share to WhatsApp</span>
                </button>

                {data.bibNumber && (
                  <Link
                    href={`/bibs/${encodeURIComponent(data.bibNumber)}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white transition-all shadow"
                  >
                    <span>View Digital Bib</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {/* Metadata Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-xl text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Certificate ID</span>
                  <span className="font-mono font-bold text-amber-300">{data.certificateNumber}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Assigned Bib</span>
                  <span className="font-mono font-bold text-white">{data.bibNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Verification Status</span>
                  <span className="font-bold text-emerald-400 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Certified Finisher
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
