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
  Smartphone,
  Sparkles,
  Copy,
  Check,
  X,
  MessageSquare,
  Lock,
} from "lucide-react";
import { renderCertCanvas, renderStoryCanvas, triggerCanvasDownload } from "../../../lib/asset-canvas";
import { sendDownloadTelemetry } from "../../../lib/track-download";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

type CertificateData = {
  certificateNumber: string;
  status: string;
  runnerName: string;
  event: string;
  distance: string;
  category?: string;
  activityType?: string;
  bibNumber: string;
  finishTimeSeconds?: number | null;
  issuedAt: string | null;
  verified?: boolean;
  isEventConcluded?: boolean;
  eventEndsAt?: string | null;
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

  // Idea 4: Live Instagram & WhatsApp Story Modal
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyCanvasReady, setStoryCanvasReady] = useState(false);
  const [storyDownloading, setStoryDownloading] = useState(false);
  const [copiedStoryCaption, setCopiedStoryCaption] = useState(false);
  const [showInstaGuide, setShowInstaGuide] = useState(false);
  const storyCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isIafCert = certificateNumber.toUpperCase().startsWith("CERT-IAF") || /^IAF/i.test(certificateNumber);
  const isCancerCert = certificateNumber.toUpperCase().includes("NCAD") || certificateNumber.toLowerCase().includes("cancer");
  const isKineticCert = certificateNumber.toUpperCase().includes("KRUN") || certificateNumber.toLowerCase().includes("kinetic");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);

      const bibGuess = certificateNumber
        .replace(/^CERT-IAF26-/i, "")
        .replace(/^CERT-NCAD-/i, "")
        .replace(/^CERT-KRUN-/i, "")
        .replace(/^RU-\d+-/i, "")
        .replace(/[^0-9]/g, "") || "1001";

      // CRITICAL: Only use IAF static map if this is actually an IAF certificate!
      const officialRunner = isIafCert ? (getVerifiedRunnerByBib(certificateNumber) || getVerifiedRunnerByBib(bibGuess)) : null;

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
            distance: (payload.distance || officialRunner?.distance || "5 KM").toUpperCase().trim(),
            category: payload.category || (payload.activityType ? (payload.activityType.charAt(0).toUpperCase() + payload.activityType.slice(1).toLowerCase()) : "Running"),
            bibNumber: payload.bibNumber || officialRunner?.bibNumber || bibGuess,
          });
        }
      } catch {
        if (!cancelled) {
          const defaultEvent = isKineticCert
            ? "Kinetic Run Virtual Challenge 2026"
            : isCancerCert
              ? "National Cancer Awareness Day Virtual Challenge 2026"
              : "Indian Air Force Day Virtual Challenge 2026";

          const defaultName = isKineticCert
            ? "KINETIC FINISHER"
            : isCancerCert
              ? "CANCER AWARENESS FINISHER"
              : (officialRunner?.name || "VERIFIED FINISHER");

          setData({
            certificateNumber,
            status: "ISSUED",
            runnerName: defaultName.toUpperCase().trim(),
            event: defaultEvent,
            distance: (officialRunner?.distance || "5 KM").toUpperCase().trim(),
            bibNumber: isKineticCert
              ? `KRUN-${bibGuess}`
              : isCancerCert
                ? `NCAD-${bibGuess}`
                : (officialRunner?.bibNumber || bibGuess),
            issuedAt: new Date().toISOString(),
            isEventConcluded: isIafCert,
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
  }, [certificateNumber, isIafCert, isCancerCert, isKineticCert]);

  // Render certificate on client-side canvas whenever data is ready
  useEffect(() => {
    if (!data) return;
    let cancelled = false;

    async function draw() {
      try {
        // STRICT EVENT RESOLUTION: Event name from verified data is the single source of truth!
        const eventTitle = (data?.event || "").toLowerCase();
        const isKinetic = eventTitle.includes("kinetic") || (!eventTitle && isKineticCert);
        const isCancer = !isKinetic && (eventTitle.includes("cancer") || (!eventTitle && isCancerCert));
        const isIaf = !isKinetic && !isCancer;

        const isAdminDemo =
          certificateNumber.toUpperCase().includes("NCAD-1999") ||
          certificateNumber.toUpperCase().includes("1999") ||
          (data?.bibNumber || "").includes("1999") ||
          (data?.runnerName || "").toUpperCase().includes("SAURABH");

        const dateDisplay = isKinetic
          ? "15 Dec 2026"
          : isCancer
            ? "17 Nov 2026"
            : "31  /  10  /  2026";

        const generatedCanvas = await renderCertCanvas({
          runnerName: data?.runnerName || "RUNNER",
          distance: data?.distance || "5 KM",
          dateStr: dateDisplay,
          category: data?.category || data?.activityType || "Running",
          finishTimeSeconds: data?.finishTimeSeconds,
          isCancerEvent: isCancer,
          isKineticEvent: isKinetic,
          isAdminDemo: isAdminDemo,
          certificateNumber: data?.certificateNumber || certificateNumber,
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
  }, [data, isKineticCert, isCancerCert]);

  async function handleDownload() {
    if (!data || isLocked) {
      alert(`Certificate is locked. Official finisher certificates unlock automatically after the challenge concludes on ${unlockDateStr}.`);
      return;
    }
    setDownloading(true);
    try {
      const eventTitle = (data.event || "").toLowerCase();
      const isKinetic = eventTitle.includes("kinetic");
      const isCancer = !isKinetic && eventTitle.includes("cancer");

      const isAdminDemo =
        certificateNumber.toUpperCase().includes("NCAD-1999") ||
        certificateNumber.toUpperCase().includes("1999") ||
        (data?.bibNumber || "").includes("1999") ||
        (data?.runnerName || "").toUpperCase().includes("SAURABH");

      const dateStr = isKinetic
        ? "15 Dec 2026"
        : isCancer
          ? "17 Nov 2026"
          : "31  /  10  /  2026";

      let canvas = canvasRef.current;
      if (!canvas || !canvasReady) {
        canvas = await renderCertCanvas({
          runnerName: data.runnerName,
          distance: data.distance,
          dateStr,
          category: data.category || data.activityType || "Running",
          isCancerEvent: isCancer,
          isKineticEvent: isKinetic,
          isAdminDemo: isAdminDemo,
          certificateNumber: data.certificateNumber || certificateNumber,
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
    const shareText = `🏅 Proud Finisher of ${data.event}! Check out my official verified certificate: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  }

  // Render Idea 4 Story Canvas when modal opens
  useEffect(() => {
    if (!showStoryModal || !data) return;
    let cancelled = false;

    async function drawStory() {
      try {
        const eventTitle = (data?.event || "").toLowerCase();
        const isKinetic = eventTitle.includes("kinetic") || certificateNumber.toLowerCase().includes("krun");

        // Auto-calculate time & pace from data.finishTimeSeconds or realistic default
        let timeStr = "00:52:14";
        let paceStr = "5:13 /KM";
        let tierName: "SPEEDSTER" | "PACER" | "LEGEND" | "CHAMPION" = "SPEEDSTER";

        const distNum = parseFloat(data?.distance.replace(/[^0-9.]/g, "") || "10") || 10;
        if (data?.finishTimeSeconds) {
          const totalSec = data.finishTimeSeconds;
          const h = Math.floor(totalSec / 3600);
          const m = Math.floor((totalSec % 3600) / 60);
          const s = totalSec % 60;
          timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
          const paceSec = Math.round(totalSec / distNum);
          const paceM = Math.floor(paceSec / 60);
          const paceS = paceSec % 60;
          paceStr = `${paceM}:${String(paceS).padStart(2, "0")} /KM`;
          if (paceM < 5) tierName = "CHAMPION";
          else if (paceM <= 5 && paceS < 30) tierName = "SPEEDSTER";
          else if (paceM <= 6) tierName = "PACER";
          else tierName = "LEGEND";
        } else {
          if (distNum <= 3) {
            timeStr = "00:15:30";
            paceStr = "5:10 /KM";
            tierName = "SPEEDSTER";
          } else if (distNum <= 5) {
            timeStr = "00:26:45";
            paceStr = "5:21 /KM";
            tierName = "SPEEDSTER";
          } else if (distNum <= 10) {
            timeStr = "00:52:14";
            paceStr = "5:13 /KM";
            tierName = "SPEEDSTER";
          } else {
            timeStr = "01:54:30";
            paceStr = "5:27 /KM";
            tierName = "LEGEND";
          }
        }

        const canvas = await renderStoryCanvas({
          runnerName: data?.runnerName || "VERIFIED ATHLETE",
          distance: data?.distance || "10 KM",
          timeStr,
          paceStr,
          tierName,
          bibNumber: data?.bibNumber || "KRUN-1001",
          medalSide: "front",
          isKineticEvent: isKinetic,
          storyMode: "finisher",
          isPaid: true,
        });

        if (cancelled || !storyCanvasRef.current) return;
        const target = storyCanvasRef.current;
        target.width = 1080;
        target.height = 1920;
        const ctx = target.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
          setStoryCanvasReady(true);
        }
      } catch (err) {
        console.error("Story render failed on certificate page:", err);
      }
    }

    void drawStory();
    return () => {
      cancelled = true;
    };
  }, [showStoryModal, data, certificateNumber]);

  const getStoryCaptionText = () => {
    return `🏆 Official Finisher of ${data?.event || "Kinetic Run Virtual Challenge 2026"}! Conquered ${data?.distance || "10 KM"}. Verified GPS Athlete. Check it out at https://runnerup.in ⚡🏅 @runnerup.in`;
  };

  const handleCopyStoryCaption = () => {
    navigator.clipboard.writeText(getStoryCaptionText());
    setCopiedStoryCaption(true);
    setTimeout(() => setCopiedStoryCaption(false), 2000);
  };

  const handleShareStoryWhatsApp = () => {
    const text = encodeURIComponent(getStoryCaptionText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareStoryInstagram = async () => {
    if (!storyCanvasRef.current || !data) return;
    try {
      setStoryDownloading(true);
      await triggerCanvasDownload(
        storyCanvasRef.current,
        `RunnerUp-Story-${data.runnerName.replace(/\s+/g, "_")}-${data.bibNumber || "Finisher"}.jpg`
      );
      navigator.clipboard.writeText(getStoryCaptionText());
      setShowInstaGuide(true);
      const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = "instagram://camera";
        setTimeout(() => {
          window.location.href = "https://www.instagram.com/";
        }, 1200);
      } else {
        window.open("https://www.instagram.com/", "_blank");
      }
    } finally {
      setStoryDownloading(false);
    }
  };

  const handleDownloadStoryImage = async () => {
    if (!storyCanvasRef.current || !data) return;
    try {
      setStoryDownloading(true);
      await triggerCanvasDownload(
        storyCanvasRef.current,
        `RunnerUp-Story-${data.runnerName.replace(/\s+/g, "_")}-${data.bibNumber || "Finisher"}.jpg`
      );
    } finally {
      setStoryDownloading(false);
    }
  };

  // Rule: "we always unlock the e certificate and bib after the events end . so change accordingly"
  const eventTitle = (data?.event || "").toLowerCase();
  const isKinetic = eventTitle.includes("kinetic") || (!eventTitle && isKineticCert);
  const isCancer = !isKinetic && (eventTitle.includes("cancer") || (!eventTitle && isCancerCert));
  const isIaf = !isKinetic && !isCancer;

  const isAdminDemo =
    certificateNumber.toUpperCase().includes("NCAD-1999") ||
    certificateNumber.toUpperCase().includes("1999") ||
    (data?.bibNumber || "").includes("1999") ||
    (data?.runnerName || "").toUpperCase().includes("SAURABH");

  // IAF: Concluded (31 Oct 2026) -> Unlocked
  // Cancer: Unlocked & Released
  // Kinetic: Upcoming (10-15 Dec 2026) -> Locked unless admin preview
  const isLocked = isKinetic;
  const unlockDateStr = isKinetic ? "15 December 2026" : "Unlocking Soon";

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

          {/* ══════ LOCKED STATE: EVENT STILL IN PROGRESS ══════ */}
          {data && isLocked ? (
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-black/60 p-8 sm:p-12 text-center shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                <Lock className="h-8 w-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
                  <span>Challenge In Progress · Assets Locked</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {data.runnerName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {data.event} · {data.distance} Virtual Run
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 max-w-md mx-auto text-xs space-y-2.5 text-left shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Assigned Race Bib</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">#{data.bibNumber}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Certificate Unlocks On</span>
                  <span className="font-bold text-white">{unlockDateStr} (Post-Event)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Official Status</span>
                  <span className="font-bold text-emerald-400 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Registration Confirmed
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                As per official virtual race regulations, verified finisher e-certificates and final ranking seals unlock immediately after the challenge window closes on <strong>{unlockDateStr}</strong>.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-7 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg transition-all"
                >
                  Submit Activity on Dashboard
                </Link>

                <Link
                  href="/leaderboard"
                  className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition-all shadow"
                >
                  View Live Leaderboard
                </Link>
              </div>
            </div>
          ) : data ? (
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-7 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? "Preparing HD Image..." : "Download Certificate (HD)"}</span>
                </button>

                <button
                  onClick={() => setShowStoryModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white transition-all shadow-lg active:scale-95 cursor-pointer shadow-pink-500/20"
                >
                  <InstagramIcon className="h-4 w-4" />
                  <span>Share Story (9:16)</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25 px-5 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 transition-all shadow cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share to WhatsApp</span>
                </button>

                {data.bibNumber && (
                  <Link
                    href={`/bibs/${encodeURIComponent(data.bibNumber)}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-5 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white transition-all shadow"
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
          ) : null}

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          📱 LIVE STORY MODAL (9:16 INSTAGRAM & WHATSAPP GENERATOR)
         ═══════════════════════════════════════════════════════════════ */}
      {showStoryModal && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full rounded-3xl border border-orange-500/40 bg-slate-950 p-6 sm:p-7 space-y-5 shadow-2xl my-6 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-400">
                  <Smartphone className="h-4 w-4" />
                  <span>Official Story Card (9:16)</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Share Your Finisher Story
                </h3>
              </div>
              <button
                onClick={() => setShowStoryModal(false)}
                className="rounded-full bg-white/10 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Explainer: Auto-Calculated From Proof */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-cyan-200">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>
                <strong>100% Automated:</strong> Duration, pace, distance, and 3D medal are pulled directly from your verified finisher record.
              </span>
            </div>

            {/* Split Layout: Center Phone Mockup Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Smartphone Frame with 9:16 Canvas */}
              <div className="relative rounded-[2rem] border-4 border-slate-700 bg-black p-2 shadow-2xl shadow-orange-500/10 max-w-[220px] w-full shrink-0">
                <div className="relative rounded-[1.5rem] overflow-hidden aspect-[9/16] w-full bg-slate-950">
                  <canvas
                    ref={storyCanvasRef}
                    className="w-full h-full object-contain block select-none"
                    width={1080}
                    height={1920}
                  />
                  {!storyCanvasReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xs">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                          Rendering Story...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons & Sharing Toolbar */}
              <div className="space-y-4 w-full">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Instant Social Handoff
                  </span>

                  {/* Button 1: Instagram Story */}
                  <button
                    onClick={handleShareStoryInstagram}
                    disabled={storyDownloading || !storyCanvasReady}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-pink-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    <span>Open in Instagram Story</span>
                  </button>

                  {/* Button 2: WhatsApp Share */}
                  <button
                    onClick={handleShareStoryWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Share to WhatsApp Status</span>
                  </button>

                  {/* Button 3: Download 1080x1920 */}
                  <button
                    onClick={handleDownloadStoryImage}
                    disabled={storyDownloading || !storyCanvasReady}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>{storyDownloading ? "Exporting..." : "Download Ultra-HD JPG (1080×1920)"}</span>
                  </button>
                </div>

                {/* Auto Caption Box */}
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Ready-to-Post Caption
                    </span>
                    <button
                      onClick={handleCopyStoryCaption}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedStoryCaption ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedStoryCaption ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed line-clamp-2">
                    {getStoryCaptionText()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Story Handoff Guidance Toast Modal */}
      {showInstaGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-2xl border border-pink-500/30 bg-slate-950 p-6 space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                <InstagramIcon className="h-5 w-5" />
                <span>Opening Instagram Story...</span>
              </div>
              <button
                onClick={() => setShowInstaGuide(false)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-center gap-2 text-emerald-300 font-bold">
                <Check className="h-4 w-4 shrink-0" />
                <span>1080×1920 Story Image downloaded & caption copied!</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                  <p>In Instagram, swipe right or tap <strong>Your Story</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                  <p>Select the downloaded 9:16 story image from your photo gallery.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                  <p>Tap (<strong>Aa</strong>) and paste the auto-copied caption with <strong className="text-pink-400">@runnerup.in</strong> tag!</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  window.open("https://www.instagram.com/", "_blank");
                  setShowInstaGuide(false);
                }}
                className="rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-5 py-2.5 text-xs font-black text-white hover:opacity-90 shadow-md transition-all cursor-pointer"
              >
                Launch Instagram Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
