"use client";

import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Gift,
  HelpCircle,
  IndianRupee,
  MapPin,
  Medal,
  Plus,
  RefreshCw,
  Route,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Truck,
  UploadCloud,
  Users,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authHeaders, getApiUrl, readApiError } from "../../lib/api";
import { cn } from "../../lib/cn";
import { parseTimeToSeconds, validateProofForm } from "../../lib/validation";

type Registration = {
  id: string;
  bibNumber: string;
  distance: string;
  status: string;
  proofStatus: string;
  finishTimeSeconds?: number | null;
  registeredAt: string;
  event: { title: string; slug: string; benefits?: string[] };
  payment: { status: string; amountInPaise: number } | null;
  proofUpload?: {
    activityImageUrl: string;
    sourceApp: string;
    status: string;
    reviewerNote?: string | null;
  } | null;
  certificate?: {
    certificateNumber: string;
    status: string;
    pdfUrl?: string | null;
  } | null;
  medalDelivery?: {
    status: string;
    trackingNumber: string | null;
    trackingUrl?: string | null;
    courier?: string | null;
  } | null;
};

type DbUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  clerkId: string | null;
  role?: string;
  referralCode?: string | null;
  registrations: Registration[];
};

const SOURCE_APPS = [
  "Strava",
  "Garmin Connect",
  "Nike Run Club",
  "Adidas Running",
  "Apple Fitness",
  "Google Fit",
  "MapMyRun",
  "Other",
];

function formatMoney(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

function parseKm(distStr: string): number {
  if (!distStr) return 5;
  const lower = distStr.toLowerCase().trim();
  if (lower.includes("half") || lower.includes("21.1")) return 21.1;
  if (lower.includes("full") || (lower.includes("marathon") && !lower.includes("half"))) return 42.2;
  const match = distStr.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    if (!Number.isNaN(val) && val > 0) return val;
  }
  return 5;
}

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${String(s).padStart(2, "0")}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function isEligible(reg: Registration) {
  return (
    reg.status === "CONFIRMED" ||
    reg.status === "COMPLETED" ||
    reg.payment?.status === "PAID"
  );
}

function canUpload(reg: Registration) {
  return (
    isEligible(reg) &&
    (reg.proofStatus === "NOT_SUBMITTED" || reg.proofStatus === "REJECTED")
  );
}

function dedupe(rows: Registration[]) {
  const s = new Set<string>();
  return rows.filter((r) => {
    if (s.has(r.id)) return false;
    s.add(r.id);
    return true;
  });
}

async function fileToPayload(file: File): Promise<string> {
  const isImageMime = file.type ? file.type.startsWith("image/") : false;
  const isImageExt = /\.(jpe?g|png|webp|heic|bmp|gif)$/i.test(file.name);
  if (!isImageMime && !isImageExt) {
    throw new Error("Please choose an image file (JPEG, PNG, WebP).");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Image file is too large (maximum 15 MB). Please choose a smaller image.");
  }

  try {
    if (typeof window !== "undefined" && typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(bmp.width * scale));
      c.height = Math.max(1, Math.round(bmp.height * scale));
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(bmp, 0, 0, c.width, c.height);
        bmp.close();
        return c.toDataURL("image/jpeg", 0.85);
      }
      bmp.close();
    }
  } catch (err) {
    console.warn("Canvas compression failed, falling back to FileReader:", err);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read image file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export function DashboardClient() {
  const reduce = useReducedMotion();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "trophies" | "refer">("active");

  // Proof upload modal/drawer state
  const [proofRegId, setProofRegId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [sourceApp, setSourceApp] = useState("Strava");
  const [finishHours, setFinishHours] = useState("");
  const [finishMinutes, setFinishMinutes] = useState("");
  const [finishSeconds, setFinishSeconds] = useState("");
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const seq = useRef(0);

  const hoursInputRef = useRef<HTMLInputElement | null>(null);
  const minutesInputRef = useRef<HTMLInputElement | null>(null);
  const secondsInputRef = useRef<HTMLInputElement | null>(null);

  function handleTimePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const parsedSecs = parseTimeToSeconds(text);
    if (parsedSecs && parsedSecs > 0) {
      e.preventDefault();
      const h = Math.floor(parsedSecs / 3600);
      const m = Math.floor((parsedSecs % 3600) / 60);
      const s = parsedSecs % 60;
      setFinishHours(h > 0 ? String(h).padStart(2, "0") : "");
      setFinishMinutes(String(m).padStart(2, "0"));
      setFinishSeconds(String(s).padStart(2, "0"));
    }
  }

  const formattedTimePreview = useMemo(() => {
    const h = parseInt(finishHours, 10) || 0;
    const m = parseInt(finishMinutes, 10) || 0;
    const s = parseInt(finishSeconds, 10) || 0;
    if (!finishHours && !finishMinutes && !finishSeconds) return null;
    if (h === 0 && m === 0 && s === 0) return null;

    const parts: string[] = [];
    if (h > 0) parts.push(`${h} hr${h > 1 ? "s" : ""}`);
    if (m > 0 || h > 0) parts.push(`${m} min${m !== 1 ? "s" : ""}`);
    if (s > 0 || (!h && !m)) parts.push(`${s} sec${s !== 1 ? "s" : ""}`);

    const digital = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return { label: parts.join(" "), digital };
  }, [finishHours, finishMinutes, finishSeconds]);

  const load = useCallback(async () => {
    const id = ++seq.current;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Could not get session token.");
      await fetch(getApiUrl("/api/users/sync"), {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          clerkId: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          name: user?.fullName ?? user?.firstName,
          phone: user?.primaryPhoneNumber?.phoneNumber,
          avatarUrl: user?.imageUrl,
        }),
      });
      const res = await fetch(getApiUrl("/api/users/me"), {
        headers: authHeaders(token),
      });
      if (!res.ok) throw new Error(await readApiError(res, "Could not load dashboard"));
      const json = await res.json();
      if (seq.current === id) setDbUser(json.data as DbUser);
    } catch (err) {
      if (seq.current === id) setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      if (seq.current === id) setLoading(false);
    }
  }, [getToken, isSignedIn, user]);

  const loadMe = useCallback(async () => {
    const id = ++seq.current;
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(getApiUrl("/api/users/me"), { headers: authHeaders(token) });
      if (!res.ok) return;
      const json = await res.json();
      if (seq.current === id) setDbUser(json.data as DbUser);
    } catch {
      // keep last known state
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      const t = setTimeout(() => void load(), 0);
      return () => clearTimeout(t);
    }
  }, [isLoaded, load]);

  const registrations = useMemo(() => dedupe(dbUser?.registrations ?? []), [dbUser]);
  const isAdmin = dbUser?.role === "ADMIN" || dbUser?.role === "SUPER_ADMIN";

  // Categorize registrations for clean tabs
  const activeRegistrations = useMemo(() => {
    return registrations.filter((r) => r.status !== "CANCELLED");
  }, [registrations]);

  const trophyRegistrations = useMemo(() => {
    return registrations.filter(
      (r) =>
        r.proofStatus === "APPROVED" ||
        Boolean(r.certificate) ||
        Boolean(r.medalDelivery),
    );
  }, [registrations]);

  const totalKmRun = useMemo(() => {
    return activeRegistrations.reduce((acc, r) => acc + parseKm(r.distance), 0);
  }, [activeRegistrations]);

  const verifiedFinishesCount = useMemo(() => {
    return registrations.filter((r) => r.proofStatus === "APPROVED").length;
  }, [registrations]);

  const hasPending = useMemo(
    () =>
      registrations.some(
        (r) => r.payment?.status === "CREATED" || r.proofStatus === "SUBMITTED",
      ),
    [registrations],
  );

  useEffect(() => {
    if (!hasPending || !isLoaded) return;
    const interval = setInterval(() => {
      void loadMe();
    }, 30_000);
    return () => clearInterval(interval);
  }, [hasPending, isLoaded, loadMe]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function onPickFile(file: File | null) {
    setProofError(null);
    setProofFileName(null);
    setProofUrl("");
    if (!file) return;
    try {
      setProofBusy(true);
      setProofUrl(await fileToPayload(file));
      setProofFileName(file.name);
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Could not read image");
    } finally {
      setProofBusy(false);
    }
  }

  async function submitProof(e: FormEvent) {
    e.preventDefault();
    if (!proofRegId) return;
    setProofBusy(true);
    setProofMessage(null);
    setProofError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Please sign in again to submit proof.");
      let url = proofUrl.trim();

      const errors = validateProofForm({
        proofUrl: url,
        sourceApp,
        finishHours,
        finishMinutes,
        finishSeconds,
      });

      const firstError = Object.values(errors).find(Boolean);
      if (firstError) {
        throw new Error(firstError);
      }

      if (url.startsWith("data:") || url.startsWith("https://") || url.startsWith("http://")) {
        if (url.startsWith("data:")) {
          const up = await fetch(getApiUrl("/api/uploads/image"), {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({ file: url, folder: "runnerup/proofs" }),
          });
          if (!up.ok) {
            if (!url.startsWith("https://")) {
              throw new Error(await readApiError(up, "Image upload failed. Please try again."));
            }
          } else {
            const upJson = await up.json();
            url = upJson.data?.url || url;
          }
        }
      }

      const h = Math.max(0, parseInt(finishHours, 10) || 0);
      const m = Math.max(0, parseInt(finishMinutes, 10) || 0);
      const s = Math.max(0, parseInt(finishSeconds, 10) || 0);
      const totalSecs = h * 3600 + m * 60 + s;

      if (totalSecs > 0 && totalSecs < 60) {
        throw new Error("Finish time cannot be under 1 minute. Please check your entered time or leave it empty.");
      }

      const secs = totalSecs > 0 ? totalSecs : undefined;

      const res = await fetch(getApiUrl(`/api/registrations/${proofRegId}/proof`), {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          activityImageUrl: url,
          sourceApp: sourceApp.trim() || "Strava",
          finishTimeSeconds: secs,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Proof submission failed. Please try again."));
      }

      setProofMessage("Proof submitted successfully! You'll receive your e-certificate after verification.");
      setProofRegId(null);
      setProofUrl("");
      setProofFileName(null);
      setFinishHours("");
      setFinishMinutes("");
      setFinishSeconds("");
      await load();
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Proof submit failed");
    } finally {
      setProofBusy(false);
    }
  }

  function handleCopyReferral() {
    const code = dbUser?.referralCode || user?.id?.slice(-6) || "runnerup";
    const link = `https://runnerup.in/register?ref=${code}`;
    void navigator.clipboard.writeText(link);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[75vh] w-full bg-[#090d16] text-white flex items-center justify-center pt-28 pb-20 relative overflow-hidden">
        <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-sky-500/20 blur-[120px]" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-white/20 border-t-sky-400" />
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">Loading Athlete Profile...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="w-full min-h-[80vh] bg-[#090d16] text-white pt-28 sm:pt-32 pb-20 relative overflow-hidden flex items-center justify-center">
        <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-sky-500/20 blur-[140px]" />
        <div className="mx-auto max-w-xl px-4 text-center relative z-10">
          <div className="rounded-[28px] border border-white/20 bg-white/[0.06] p-8 sm:p-12 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_25px_60px_rgba(0,0,0,0.8)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-inner">
              <Users className="h-8 w-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Athlete Sign In Required
            </h1>
            <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-slate-300 font-medium">
              Access your registered race bibs, GPS proof submission portal, medal tracking, and official verified certificates.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link className="neon-btn-blue rounded-full px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl" href="/sign-in">
                Sign In Now
              </Link>
              <Link className="rounded-full border border-white/20 bg-white/[0.08] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xl hover:bg-white/20 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" href="/sign-up">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const name = dbUser?.name || user?.fullName || user?.firstName || "Runner";
  const firstName = name.split(" ")[0];

  return (
    <div className="w-full min-h-screen bg-[#14242a] text-white relative overflow-hidden isolate">
      {/* ─── Ambient Radiant Aurora Orbs ─── */}
      <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[800px] rounded-full bg-[#244855]/40 blur-[150px]" />
      <div className="pointer-events-none absolute top-1/2 right-10 -z-10 h-[400px] w-[400px] rounded-full bg-[#e64833]/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-20 left-10 -z-10 h-[350px] w-[350px] rounded-full bg-[#90aead]/15 blur-[130px]" />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: ATHLETE FROSTED GLASS HERO & METRICS (MOBILE OPTIMIZED)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full pt-20 sm:pt-28 pb-6 sm:pb-10">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
          
          {/* Athlete Glass Hero Card */}
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[28px] border border-[#90aead]/20 bg-[#172c34]/90 p-4.5 sm:p-8 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(230,72,51,0.1)]">
            {/* Top Specular Neon Energy Strip */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#e64833] via-[#874f41] to-[#90aead] opacity-90" />

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between pt-1">
              
              {/* Profile Bio */}
              <div className="flex items-center gap-3.5 sm:gap-5">
                <div className="relative flex h-14 w-14 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#e64833] via-[#874f41] to-[#244855] font-black text-[#fbe9d0] text-lg sm:text-2xl shadow-xl ring-2 sm:ring-4 ring-[#e64833]/40">
                  {user?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.imageUrl}
                      alt={name}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    name.slice(0, 2).toUpperCase()
                  )}
                  {verifiedFinishesCount > 0 && (
                    <span className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg border-2 border-[#14242a]">
                      🥇
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="rounded-full bg-[#e64833]/25 border border-[#e64833]/50 px-2.5 py-0.5 text-[0.6rem] sm:text-[0.65rem] font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_10px_rgba(230,72,51,0.3)]">
                      {isAdmin ? "Admin Ops" : "Verified Athlete ⚡"}
                    </span>
                    {verifiedFinishesCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-emerald-300">
                        <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" /> Finisher
                      </span>
                    )}
                  </div>
                  <h1 className="mt-1 font-display text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] truncate">
                    Welcome Back, {firstName}
                  </h1>
                  <p className="text-[0.75rem] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              {/* 3 Frosted Glass Metric Tiles (Mobile Ergonomic) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/10 pt-3.5 lg:border-t-0 lg:pt-0">
                <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-2.5 sm:p-4 text-center backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:bg-white/[0.08]">
                  <p className="text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 truncate">
                    Distance
                  </p>
                  <p className="mt-0.5 sm:mt-1 font-mono text-lg sm:text-2xl lg:text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(230,72,51,0.5)]">
                    {totalKmRun} <span className="text-[0.65rem] sm:text-xs font-bold text-[#e64833]">KM</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-2.5 sm:p-4 text-center backdrop-blur-xl shadow-[inset_0_1px_0_rgba(251,191,36,0.25)] transition-all hover:bg-amber-500/15">
                  <p className="text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-amber-300 truncate">
                    Medals
                  </p>
                  <p className="mt-0.5 sm:mt-1 font-mono text-lg sm:text-2xl lg:text-3xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
                    {verifiedFinishesCount} <span className="text-sm sm:text-base">🏅</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-2.5 sm:p-4 text-center backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:bg-white/[0.08]">
                  <p className="text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 truncate">
                    Races
                  </p>
                  <p className="mt-0.5 sm:mt-1 font-mono text-lg sm:text-2xl lg:text-3xl font-black text-[#90aead] drop-shadow-[0_0_12px_rgba(144,174,173,0.5)]">
                    {activeRegistrations.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Glass Action Bar Strip (Mobile Optimized) */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/10 pt-3.5 sm:pt-4">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <span>GPS Activity Sync · Verified Timings · Doorstep Medal Delivery</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
                  <Link
                    className="neon-btn-blue flex-1 sm:flex-initial justify-center rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg inline-flex items-center gap-1.5"
                    href="/events"
                  >
                    <Plus className="h-3.5 w-3.5" /> <span>Join Race</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      className="rounded-full border border-white/20 bg-white/[0.08] px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur-xl shrink-0"
                      href="/admin"
                    >
                      Admin
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => void handleRefresh()}
                    disabled={refreshing}
                    className="h-9 w-9 sm:h-auto sm:w-auto rounded-full border border-white/15 bg-white/[0.06] p-2 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-200 hover:bg-white/15 hover:text-white backdrop-blur-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    type="button"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <button
                    onClick={() => openUserProfile()}
                    className="h-9 w-9 sm:h-auto sm:w-auto rounded-full border border-white/15 bg-white/[0.06] p-2 sm:px-3 sm:py-2 text-xs font-bold text-slate-300 hover:bg-white/15 hover:text-white backdrop-blur-xl cursor-pointer inline-flex items-center justify-center"
                    type="button"
                    title="Account Settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => void signOut(() => router.push("/"))}
                    className="h-9 w-9 sm:h-auto sm:w-auto rounded-full border border-rose-500/40 bg-rose-500/15 p-2 sm:px-3.5 sm:py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/25 hover:text-white backdrop-blur-xl cursor-pointer inline-flex items-center justify-center gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    type="button"
                    title="Sign out"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-300" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3.5 sm:mt-4 flex items-center justify-between rounded-2xl border border-rose-500/40 bg-rose-500/15 p-3.5 sm:p-4 text-xs sm:text-sm font-bold text-rose-200 backdrop-blur-xl">
              <span>{error}</span>
              <button
                onClick={() => void load()}
                className="font-black underline cursor-pointer"
                type="button"
              >
                Retry
              </button>
            </div>
          )}

          {/* Success Proof Message */}
          {proofMessage && (
            <div className="mt-3.5 sm:mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-3.5 sm:p-4 text-xs sm:text-sm font-bold text-emerald-200 backdrop-blur-xl shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{proofMessage}</span>
            </div>
          )}

          {/* Frosted Glass Navigation Tabs (Mobile Clean Responsive) */}
          <div className="mt-5 sm:mt-6 rounded-2xl sm:rounded-full bg-black/40 p-1 border border-white/10 backdrop-blur-2xl flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl sm:rounded-full px-3.5 sm:px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "active"
                  ? "bg-gradient-to-r from-[#e64833]/40 via-[#874f41]/35 to-[#e64833]/20 border border-[#e64833]/80 text-[#fbe9d0] shadow-[0_0_18px_rgba(230,72,51,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl"
                  : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Route className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#e64833]" />
              <span>
                <span className="sm:hidden">Events</span>
                <span className="hidden sm:inline">My Registered Events</span> ({activeRegistrations.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("trophies")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl sm:rounded-full px-3.5 sm:px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "trophies"
                  ? "bg-gradient-to-r from-[#fbe9d0]/30 via-[#874f41]/40 to-[#e64833]/20 border border-[#fbe9d0]/60 text-[#fbe9d0] shadow-[0_0_18px_rgba(251,233,208,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl"
                  : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
              <span>
                <span className="sm:hidden">Trophies</span>
                <span className="hidden sm:inline">Trophy Cabinet</span> ({trophyRegistrations.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("refer")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl sm:rounded-full px-3.5 sm:px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "refer"
                  ? "bg-gradient-to-r from-[#244855]/60 via-[#874f41]/35 to-[#244855]/40 border border-[#90aead]/60 text-white shadow-[0_0_18px_rgba(144,174,173,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl"
                  : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#90aead]" />
              <span>
                <span className="sm:hidden">Refer & Earn</span>
                <span className="hidden sm:inline">Refer & Earn Rewards</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: FROSTED GLASS CARDS & PROOFS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full py-6 sm:py-12">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
          
          {/* ── TAB 1: MY REGISTERED EVENTS ── */}
          {activeTab === "active" && (
            <div className="space-y-6">
              {activeRegistrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/15 bg-white/[0.04] p-10 sm:p-16 text-center backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_25px_60px_rgba(0,0,0,0.7)]">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.08] text-[#e64833] border border-white/10">
                    <Medal className="h-8 w-8" />
                  </span>
                  <h3 className="mt-4 font-display font-black text-lg sm:text-xl uppercase tracking-tight text-white">
                    No active race registrations yet
                  </h3>
                  <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-slate-300 font-medium">
                    Pick your challenge distance, get your official bib, and run at your own pace anywhere in India.
                  </p>
                  <Link className="neon-btn-blue mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-xl" href="/events">
                    <span>Explore Open Events</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                activeRegistrations.map((reg) => {
                  const isPaid = reg.payment?.status === "PAID" || reg.status === "CONFIRMED";
                  const isProofSubmitted = reg.proofStatus === "SUBMITTED";
                  const isVerified = reg.proofStatus === "APPROVED";
                  const isCertReady = Boolean(reg.certificate && reg.certificate.status !== "QUEUED");
                  const isMedalDispatched = Boolean(reg.medalDelivery && (reg.medalDelivery.status === "DISPATCHED" || reg.medalDelivery.status === "DELIVERED"));
                  const formOpen = proofRegId === reg.id;

                  return (
                    <div
                      key={reg.id}
                      id={`reg-${reg.id}`}
                      className="rounded-3xl sm:rounded-[28px] border border-white/15 bg-[#172c34]/90 overflow-hidden backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-[#e64833]/50"
                    >
                      {/* Event Header */}
                      <div className="p-4 sm:p-6 border-b border-white/10 bg-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display font-black text-base sm:text-2xl uppercase tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                              {reg.event.title}
                            </h2>
                            <span className="rounded-full bg-[#244855] border border-[#90aead]/40 px-2.5 py-0.5 font-mono text-[0.65rem] sm:text-xs font-bold text-[#fbe9d0] shadow-[0_0_8px_rgba(36,72,85,0.3)]">
                              {reg.distance}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-[0.7rem] sm:text-xs text-slate-300 font-medium">
                            <span className="font-mono font-bold text-white">
                              Bib: {reg.bibNumber}
                            </span>
                            <span>·</span>
                            <span>
                              Joined{" "}
                              {new Date(reg.registeredAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Payment Status Pill */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-3 py-1 text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              Paid {reg.payment?.amountInPaise ? formatMoney(reg.payment.amountInPaise) : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 px-3 py-1 text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              Payment Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 4-Step Runner Journey Track (Mobile Ergonomic) */}
                      <div className="p-3.5 sm:p-6 border-b border-white/10 bg-black/20">
                        <p className="text-[0.6rem] sm:text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 sm:mb-3">
                          Event Progress Pipeline
                        </p>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3.5">
                          {/* Step 1: Registered & Paid */}
                          <div
                            className={`rounded-2xl border p-2.5 sm:p-3.5 backdrop-blur-xl transition-all ${
                              isPaid
                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                                : "border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span
                                className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg text-[0.65rem] sm:text-xs font-black ${
                                  isPaid ? "bg-emerald-500 text-slate-950" : "bg-amber-500 text-slate-950"
                                }`}
                              >
                                1
                              </span>
                              <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider truncate">Registration</span>
                            </div>
                            <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-slate-300 font-medium truncate">
                              {isPaid ? "Confirmed & Bib Assigned" : "Payment Required"}
                            </p>
                          </div>

                          {/* Step 2: GPS Proof Submission */}
                          <div
                            className={`rounded-2xl border p-2.5 sm:p-3.5 backdrop-blur-xl transition-all ${
                              isVerified
                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                                : isProofSubmitted
                                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                                  : "border-white/10 bg-white/[0.04] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span
                                className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg text-[0.65rem] sm:text-xs font-black ${
                                  isVerified
                                    ? "bg-emerald-500 text-slate-950"
                                    : isProofSubmitted
                                      ? "bg-amber-500 text-slate-950"
                                      : "bg-white/10 text-slate-300"
                                }`}
                              >
                                2
                              </span>
                              <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider truncate">GPS Run</span>
                            </div>
                            <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-slate-300 font-medium truncate">
                              {isVerified
                                ? "Proof Approved"
                                : isProofSubmitted
                                  ? "Under Review (24-48h)"
                                  : "Upload Activity"}
                            </p>
                          </div>

                          {/* Step 3: Verified Timing */}
                          <div
                            className={`rounded-2xl border p-2.5 sm:p-3.5 backdrop-blur-xl transition-all ${
                              isVerified
                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                                : "border-white/10 bg-white/[0.04] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span
                                className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg text-[0.65rem] sm:text-xs font-black ${
                                  isVerified ? "bg-emerald-500 text-slate-950" : "bg-white/10 text-slate-300"
                                }`}
                              >
                                3
                              </span>
                              <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider truncate">Finish Time</span>
                            </div>
                            <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] font-mono font-bold text-white truncate">
                              {isVerified && reg.finishTimeSeconds
                                ? formatDuration(reg.finishTimeSeconds)
                                : "Pending Finish"}
                            </p>
                          </div>

                          {/* Step 4: Certificate & Rewards */}
                          <div
                            className={`rounded-2xl border p-2.5 sm:p-3.5 backdrop-blur-xl transition-all ${
                              isCertReady
                                ? "border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                                : "border-white/10 bg-white/[0.04] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span
                                className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg text-[0.65rem] sm:text-xs font-black ${
                                  isCertReady ? "bg-amber-500 text-slate-950" : "bg-white/10 text-slate-300"
                                }`}
                              >
                                4
                              </span>
                              <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider truncate">Rewards Kit</span>
                            </div>
                            <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-slate-300 font-medium truncate">
                              {isCertReady
                                ? isMedalDispatched
                                  ? "Medal Dispatched"
                                  : "Certificate Ready"
                                : "On Verified Finish"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar (Mobile Responsive) */}
                      <div className="p-3.5 sm:p-5 bg-white/[0.03] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <Link
                            className="rounded-full border border-white/15 bg-white/[0.06] px-3 sm:px-3.5 py-1.5 sm:py-2 text-[0.7rem] sm:text-xs font-bold text-slate-200 hover:text-white hover:bg-white/15 backdrop-blur-xl transition-all inline-flex items-center gap-1"
                            href={`/events/${reg.event.slug}`}
                          >
                            Details <ExternalLink className="h-3 w-3" />
                          </Link>

                          <Link
                            className="rounded-full border border-white/15 bg-white/[0.06] px-3 sm:px-3.5 py-1.5 sm:py-2 text-[0.7rem] sm:text-xs font-bold text-slate-200 hover:text-white hover:bg-white/15 backdrop-blur-xl transition-all inline-flex items-center gap-1"
                            href={`/leaderboard?event=${reg.event.slug}&distance=${encodeURIComponent(reg.distance)}`}
                          >
                            Leaderboard <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />
                          </Link>

                          {isCertReady && (
                            <Link
                              className="neon-btn-blue rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-[0.7rem] sm:text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-md inline-flex items-center gap-1"
                              href={`/certificates/${reg.certificate!.certificateNumber}`}
                            >
                              <Award className="h-3.5 w-3.5" /> Certificate
                            </Link>
                          )}

                          {reg.medalDelivery?.trackingNumber && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[0.7rem] text-slate-300 backdrop-blur-xl">
                              <Truck className="h-3 w-3 text-[#e64833]" />
                              <span className="font-mono font-bold text-white">{reg.medalDelivery.trackingNumber}</span>
                            </span>
                          )}
                        </div>

                        {/* Primary Action */}
                        <div className="w-full sm:w-auto">
                          {!isPaid ? (
                            <Link className="neon-btn-blue w-full sm:w-auto justify-center rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg inline-flex items-center gap-1" href="/register">
                              <span>Complete Payment</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          ) : canUpload(reg) ? (
                            <button
                              onClick={() => {
                                setProofRegId(formOpen ? null : reg.id);
                                setProofMessage(null);
                                setProofError(null);
                              }}
                              className={`w-full sm:w-auto justify-center rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-lg ${
                                formOpen
                                  ? "border border-white/20 bg-white/15 text-white backdrop-blur-xl"
                                  : "neon-btn-blue text-[#fbe9d0]"
                              }`}
                              type="button"
                            >
                              <UploadCloud className="h-4 w-4" />
                              {formOpen ? "Close Uploader" : "Upload GPS Run Proof"}
                            </button>
                          ) : isProofSubmitted ? (
                            <span className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-300 backdrop-blur-xl">
                              <Clock className="h-3.5 w-3.5" /> Proof Under Review
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* GPS Proof Submission Drawer */}
                      {formOpen && (
                        <form
                          className="border-t border-white/15 bg-[#14242a]/90 p-5 sm:p-7 backdrop-blur-2xl"
                          onSubmit={submitProof}
                          noValidate
                        >
                          <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                <UploadCloud className="h-4 w-4 text-[#e64833]" />
                                Submit GPS Proof for {reg.event.title} ({reg.distance})
                              </h3>
                              <button
                                type="button"
                                onClick={() => setProofRegId(null)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {proofError && (
                              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/20 p-3.5 text-xs font-bold text-rose-200 backdrop-blur-xl">
                                {proofError}
                              </div>
                            )}

                            <label className="block">
                              <span className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                Activity Screenshot (Strava / Nike / Garmin / Apple)
                              </span>
                              <input
                                accept="image/*"
                                className="w-full rounded-2xl border border-white/15 bg-white/[0.06] p-3 text-xs text-white file:mr-3 file:rounded-xl file:border-0 file:bg-[#e64833] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-[#fbe9d0] cursor-pointer backdrop-blur-xl"
                                disabled={proofBusy}
                                onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
                                type="file"
                              />
                              {proofFileName && (
                                <p className="mt-1.5 text-xs font-bold text-[#e64833]">Ready: {proofFileName}</p>
                              )}
                            </label>

                            {proofUrl && (proofUrl.startsWith("data:") || /\.(png|jpe?g|webp)/i.test(proofUrl)) && (
                              <div className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/80 max-w-sm backdrop-blur-xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt="Preview" className="max-h-48 w-full object-contain" src={proofUrl} />
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <label className="block">
                                <span className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                  Tracking App
                                </span>
                                <select
                                  className="h-10 w-full rounded-2xl border border-white/15 bg-slate-900/90 px-3 text-xs font-bold text-white focus:border-[#e64833] focus:outline-none backdrop-blur-xl"
                                  onChange={(e) => setSourceApp(e.target.value)}
                                  required
                                  value={sourceApp}
                                >
                                  {SOURCE_APPS.map((a) => (
                                    <option key={a} value={a}>
                                      {a}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                  Finish Time (Optional)
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    ref={hoursInputRef}
                                    aria-label="Hours"
                                    className="h-10 w-16 rounded-xl border border-white/15 bg-white/[0.06] text-center font-mono text-xs font-bold text-white focus:border-[#e64833] focus:outline-none backdrop-blur-xl"
                                    max={23}
                                    min={0}
                                    onPaste={handleTimePaste}
                                    onChange={(e) => {
                                      const val = e.target.value.slice(0, 2);
                                      setFinishHours(val);
                                      if (val.length === 2 && minutesInputRef.current) {
                                        minutesInputRef.current.focus();
                                      }
                                    }}
                                    placeholder="HH"
                                    type="number"
                                    value={finishHours}
                                  />
                                  <span className="font-mono text-sm text-slate-400">:</span>
                                  <input
                                    ref={minutesInputRef}
                                    aria-label="Minutes"
                                    className="h-10 w-16 rounded-xl border border-white/15 bg-white/[0.06] text-center font-mono text-xs font-bold text-white focus:border-[#e64833] focus:outline-none backdrop-blur-xl"
                                    max={59}
                                    min={0}
                                    onPaste={handleTimePaste}
                                    onChange={(e) => {
                                      const val = e.target.value.slice(0, 2);
                                      setFinishMinutes(val);
                                      if (val.length === 2 && secondsInputRef.current) {
                                        secondsInputRef.current.focus();
                                      }
                                    }}
                                    placeholder="MM"
                                    type="number"
                                    value={finishMinutes}
                                  />
                                  <span className="font-mono text-sm text-slate-400">:</span>
                                  <input
                                    ref={secondsInputRef}
                                    aria-label="Seconds"
                                    className="h-10 w-16 rounded-xl border border-white/15 bg-white/[0.06] text-center font-mono text-xs font-bold text-white focus:border-[#e64833] focus:outline-none backdrop-blur-xl"
                                    max={59}
                                    min={0}
                                    onPaste={handleTimePaste}
                                    onChange={(e) => {
                                      setFinishSeconds(e.target.value.slice(0, 2));
                                    }}
                                    placeholder="SS"
                                    type="number"
                                    value={finishSeconds}
                                  />
                                </div>
                              </div>
                            </div>

                            {formattedTimePreview && (
                              <p className="text-xs text-[#e64833] font-bold drop-shadow-[0_0_8px_rgba(230,72,51,0.5)]">
                                ⏱ Entered Time: {formattedTimePreview.label} ({formattedTimePreview.digital})
                              </p>
                            )}

                            <div className="flex items-center gap-2.5 pt-2">
                              <button
                                className="neon-btn-blue rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg cursor-pointer disabled:opacity-50"
                                disabled={proofBusy}
                                type="submit"
                              >
                                {proofBusy ? "Submitting..." : "Submit Proof"}
                              </button>
                              <button
                                className="rounded-full border border-white/20 bg-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white backdrop-blur-xl cursor-pointer"
                                onClick={() => {
                                  setProofRegId(null);
                                  setProofUrl("");
                                  setProofFileName(null);
                                  setProofError(null);
                                }}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── TAB 2: TROPHY CABINET & CERTIFICATES (MOBILE OPTIMIZED) ── */}
          {activeTab === "trophies" && (
            <div className="space-y-4 sm:space-y-6">
              {trophyRegistrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl sm:rounded-[28px] border border-amber-400/30 bg-amber-500/10 p-8 sm:p-16 text-center backdrop-blur-3xl shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                  <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 text-2xl sm:text-3xl shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                    🏆
                  </span>
                  <h3 className="mt-4 font-display font-black text-base sm:text-xl uppercase tracking-tight text-white">
                    Trophy Cabinet is currently empty
                  </h3>
                  <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-slate-300 font-medium">
                    Complete any virtual race and upload your GPS activity to unlock your official e-certificate and medal delivery tracking!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
                  {trophyRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="rounded-3xl sm:rounded-[28px] border border-amber-400/35 bg-gradient-to-b from-amber-500/15 via-[#172c34]/70 to-[#14242a] p-4.5 sm:p-6 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(251,191,36,0.3),0_20px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-amber-500/25 border border-amber-400/50 px-2.5 sm:px-3 py-0.5 text-[0.6rem] sm:text-[0.65rem] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                            Official Finisher 🥇
                          </span>
                          <span className="font-mono text-xs text-slate-300 font-bold">Bib: {reg.bibNumber}</span>
                        </div>

                        <h3 className="mt-2.5 sm:mt-3 font-display font-black text-lg sm:text-xl uppercase tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{reg.event.title}</h3>
                        <p className="text-xs text-[#fbe9d0] font-bold mt-0.5">{reg.distance} Category</p>

                        {reg.finishTimeSeconds && (
                          <p className="mt-2 text-xs text-slate-300 font-medium">
                            Official Finish Time:{" "}
                            <strong className="text-white font-mono font-black">
                              {formatDuration(reg.finishTimeSeconds)}
                            </strong>
                          </p>
                        )}

                        {/* Medal Delivery Info */}
                        {reg.medalDelivery && (
                          <div className="mt-3.5 sm:mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-xs backdrop-blur-xl">
                            <p className="font-bold text-white flex items-center gap-1.5">
                              <Medal className="h-3.5 w-3.5 text-amber-400 shrink-0" /> Medal Status:{" "}
                              <span className="text-[#90aead] font-semibold">{reg.medalDelivery.status}</span>
                            </p>
                            {reg.medalDelivery.trackingNumber && (
                              <p className="mt-1 text-slate-300 font-mono text-[0.7rem]">
                                Courier: {reg.medalDelivery.courier || "SpeedPost"} · {reg.medalDelivery.trackingNumber}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-white/10 flex items-center gap-2">
                        {reg.certificate && reg.certificate.status !== "QUEUED" ? (
                          <Link
                            className="neon-btn-blue rounded-full h-10 w-full text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg flex items-center justify-center gap-2"
                            href={`/certificates/${reg.certificate.certificateNumber}`}
                          >
                            <Award className="h-4 w-4" /> Download Certificate
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400 text-center w-full font-medium">
                            Certificate generating upon verification...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: REFER & EARN REWARDS (MOBILE OPTIMIZED) ── */}
          {activeTab === "refer" && (
            <div className="rounded-3xl sm:rounded-[28px] border border-[#90aead]/35 bg-gradient-to-b from-[#244855]/30 via-[#172c34]/60 to-[#14242a] p-4.5 sm:p-10 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(144,174,173,0.3),0_25px_60px_rgba(0,0,0,0.7)] max-w-3xl">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#244855] border border-[#90aead]/40 px-3 py-0.5 sm:py-1 text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_10px_rgba(36,72,85,0.3)]">
                  <Gift className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Referral Program
                </span>
                <h2 className="mt-2.5 sm:mt-3 font-display font-black text-xl sm:text-3xl uppercase tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  Invite Friends, Earn Free Race Entries
                </h2>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Share your unique runner link with running clubs, friends, and family. Get rewarded for every friend who joins any RunnerUp event!
                </p>

                {/* Referral Link Box */}
                <div className="mt-4 sm:mt-6 rounded-2xl border border-white/15 bg-white/[0.05] p-3 sm:p-4 backdrop-blur-xl">
                  <p className="text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1.5 sm:mb-2">
                    Your Unique Runner Link
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://runnerup.in/register?ref=${dbUser?.referralCode || user?.id?.slice(-6) || "runnerup"}`}
                      className="h-10 w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 font-mono text-[0.7rem] sm:text-xs text-white focus:outline-none backdrop-blur-xl"
                    />
                    <button
                      onClick={handleCopyReferral}
                      className="neon-btn-blue h-10 rounded-xl px-5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shrink-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      type="button"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedCode ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 sm:p-4 backdrop-blur-xl">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">1. Share Your Link</h4>
                    <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-slate-400 font-medium">
                      Send your link on WhatsApp, Strava, or Instagram runner groups.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 sm:p-4 backdrop-blur-xl">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">2. Earn Free Kit & Discounts</h4>
                    <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-slate-400 font-medium">
                      Get coupon codes applied automatically to future race registrations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: ATHLETE DESK & SUPPORT (MOBILE OPTIMIZED FROSTED GLASS)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full py-6 sm:py-14">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
          <div className="rounded-3xl sm:rounded-[28px] border border-[#90aead]/20 bg-[#172c34]/90 p-5 sm:p-10 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_25px_60px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
            <div className="max-w-xl text-center md:text-left">
              <span className="rounded-full bg-[#e64833]/20 border border-[#e64833]/40 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-[0_0_8px_rgba(230,72,51,0.25)]">
                Official Athlete Desk
              </span>
              <h3 className="mt-2 sm:mt-3 font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Need Help With GPS Proof or Strava Sync?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium">
                Our verification team reviews runs within 24 hours. Contact our official WhatsApp runner support desk anytime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full md:w-auto">
              <a
                href="https://wa.me/918287831071"
                target="_blank"
                rel="noopener noreferrer"
                className="neon-btn-blue justify-center rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg flex items-center gap-2"
              >
                <span>WhatsApp Runner Desk</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/leaderboard"
                className="justify-center rounded-full border border-[#90aead]/30 bg-[#244855]/50 px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider text-[#fbe9d0] backdrop-blur-xl hover:bg-[#244855] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center"
              >
                View National Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
