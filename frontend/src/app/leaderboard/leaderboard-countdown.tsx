"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ShieldCheck, Trophy, Award, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

// Target Reveal Time: 31 October 2026, 12:00:00 PM IST (UTC+5:30)
export const LEADERBOARD_REVEAL_TIMESTAMP = new Date("2026-10-31T12:00:00+05:30").getTime();

type UserReg = {
  id: string;
  distance: string;
  bibNumber: string;
  proofStatus: string;
  status: string;
  finishTimeSeconds: number | null;
};

interface LeaderboardCountdownProps {
  userReg?: UserReg | null;
  onTimerComplete?: () => void;
}

export function LeaderboardCountdown({ userReg, onTimerComplete }: LeaderboardCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isRevealed: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isRevealed: false,
  });

  useEffect(() => {
    function calculateTime() {
      const now = Date.now();
      const diff = LEADERBOARD_REVEAL_TIMESTAMP - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isRevealed: true });
        if (onTimerComplete) {
          onTimerComplete();
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isRevealed: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [onTimerComplete]);

  if (timeLeft.isRevealed) {
    return null;
  }

  const hasSubmitted = userReg?.proofStatus === "SUBMITTED" || userReg?.proofStatus === "APPROVED";
  const needsSubmission = userReg && (userReg.proofStatus === "NOT_SUBMITTED" || userReg.proofStatus === "REJECTED");

  return (
    <div className="my-8 rounded-3xl border border-[#90aead]/30 bg-[#14242a] text-[#fbe9d0] shadow-2xl overflow-hidden relative isolate">
      {/* Top Indian Tricolor Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="p-6 sm:p-10 text-center relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#e64833]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

        {/* ── Personal User Status Callout (if signed in) ── */}
        {hasSubmitted && (
          <div className="mb-6 mx-auto max-w-xl rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-left shadow-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-emerald-300">
                  Your Activity Proof is Submitted &amp; Under Arbiter Review!
                </p>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
                  Bib: <strong className="text-white font-mono">{userReg.bibNumber}</strong> ({userReg.distance}). Your official validated rank and QR-verified certificate will unlock when the countdown reaches zero!
                </p>
              </div>
            </div>
          </div>
        )}

        {needsSubmission && (
          <div className="mb-6 mx-auto max-w-xl rounded-2xl border border-rose-500/50 bg-rose-500/10 p-4 text-left shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-rose-300">
                    Action Required: Submit Your Activity Proof Before 11:59 PM Tonight!
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                    Bib: <strong className="text-white font-mono">{userReg.bibNumber}</strong> ({userReg.distance}) — Upload your GPS screenshot to be included on the final leaderboard.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#e64833] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#c93b27] shrink-0"
              >
                <span>Upload Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider mb-4">
          <Clock className="h-4 w-4" />
          <span>Official Results Reveal &bull; 31 Oct, 12:00 PM IST</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-3">
          Final Leaderboard{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e64833] via-[#ff6b57] to-amber-400">
            Unveils In
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-[#90aead] max-w-xl mx-auto mb-8 font-medium leading-relaxed">
          Our race arbiters are currently verifying all GPS activity proofs. Official category rankings, top 3 champions, and verified finish times will be unlocked on <strong>31 October at 12:00 PM (Noon) IST</strong>.
        </p>

        {/* ═══ BIG COUNTDOWN TIMER BOXES ═══ */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-5 max-w-2xl mx-auto mb-8">
          {/* Days */}
          <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#90aead]/25 bg-gradient-to-b from-[#1e3640] to-[#122127] shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-mono drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400/90 mt-1 sm:mt-2">
              Days
            </span>
          </div>

          {/* Hours */}
          <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#e64833]/40 bg-gradient-to-b from-[#1e3640] to-[#122127] shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e64833] to-transparent" />
            <span className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-mono drop-shadow-[0_2px_10px_rgba(230,72,51,0.5)]">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#ff6b57] mt-1 sm:mt-2">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#90aead]/25 bg-gradient-to-b from-[#1e3640] to-[#122127] shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-mono drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#90aead] mt-1 sm:mt-2">
              Minutes
            </span>
          </div>

          {/* Seconds */}
          <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#90aead]/25 bg-gradient-to-b from-[#1e3640] to-[#122127] shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight text-emerald-400 font-mono drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400/90 mt-1 sm:mt-2">
              Seconds
            </span>
          </div>
        </div>

        {/* Live Info Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs">
          <div className="rounded-xl border border-[#90aead]/20 bg-white/5 p-3 flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#e64833] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#fbe9d0] uppercase tracking-wider text-[11px]">Strict Verification</h4>
              <p className="text-[#90aead] text-[11px] mt-0.5">GPS pace consistency &amp; Strava route anti-cheat audit in progress.</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#90aead]/20 bg-white/5 p-3 flex items-start gap-2.5">
            <Trophy className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#fbe9d0] uppercase tracking-wider text-[11px]">Podium Honours</h4>
              <p className="text-[#90aead] text-[11px] mt-0.5">Top 3 overall category finishers announced live at 12:00 PM.</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#90aead]/20 bg-white/5 p-3 flex items-start gap-2.5">
            <Award className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#fbe9d0] uppercase tracking-wider text-[11px]">Instant E-Certificate</h4>
              <p className="text-[#90aead] text-[11px] mt-0.5">Final national rank will be unlocked on your dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="px-6 py-3 bg-black/40 border-t border-[#90aead]/15 text-center text-[11px] text-[#90aead]">
        Indian Air Force Day Virtual Challenge 2026 &bull; Official Results Disclosure: <strong>31 October 2026, 12:00:00 PM IST</strong>
      </div>
    </div>
  );
}
