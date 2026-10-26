"use client";

import { useState } from "react";
import {
  Smartphone,
  Monitor,
  Clock,
  Sparkles,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { EventNoticeCard } from "../../components/event-notice-card";

export default function ProofNoticePreviewPage() {
  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");

  return (
    <div className="min-h-screen bg-[#0e161a] text-slate-100 p-3 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Navigation & Controls Bar */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#162228]/90 p-4 sm:p-6 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-sky-400">
                <Sparkles className="h-3.5 w-3.5" /> Private Preview Mode
              </span>
              <span className="text-[0.65rem] sm:text-xs text-amber-300/90 font-medium">
                (Not visible to live runners)
              </span>
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Event Update & Proof Verification Notice
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Matching your reference design, 100% optimized for mobile screens and outdoor readability.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Device Switcher */}
            <div className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  deviceMode === "mobile"
                    ? "bg-sky-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile Phone (375px)
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  deviceMode === "desktop"
                    ? "bg-sky-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop / Tablet
              </button>
            </div>

            <Link
              href="/admin"
              className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/20 transition-all inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Admin
            </Link>
          </div>
        </div>

        {/* ── PREVIEW CANVAS ── */}
        <div className="flex justify-center">
          <div
            className={`transition-all duration-300 w-full ${
              deviceMode === "mobile"
                ? "max-w-[390px] border-4 sm:border-8 border-slate-700/80 rounded-[36px] p-3 sm:p-4 bg-[#0a1114] shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
                : "max-w-3xl"
            }`}
          >
            {/* Phone Top Notch Bar (Mobile Mode Only) */}
            {deviceMode === "mobile" && (
              <div className="mb-3 flex items-center justify-between px-3 text-[0.65rem] text-slate-400 font-mono">
                <span>9:41 AM</span>
                <div className="h-3.5 w-16 rounded-full bg-slate-800" />
                <span>5G · 100%</span>
              </div>
            )}

            <div className="space-y-4">
              {/* SECTION A: THE STANDALONE COMPONENT */}
              <div>
                <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
                  1. Standalone Component View
                </p>
                <EventNoticeCard
                  eventTitle="Indian Air Force Day Virtual Challenge 2026"
                  endDateFormatted="30 October 2026"
                />
              </div>

              {/* SECTION B: HOW IT LOOKS INSIDE THE USER DASHBOARD (UNDER REVIEW STATE) */}
              <div>
                <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-slate-400 mb-2 mt-4 px-1">
                  2. Inside Runner Dashboard (When Proof is Submitted)
                </p>

                {/* Simulated Registration Card */}
                <div className="rounded-2xl border border-white/15 bg-[#172c34]/90 overflow-hidden shadow-xl">
                  {/* Card Header */}
                  <div className="p-3.5 sm:p-5 border-b border-white/10 bg-white/[0.04] flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-black text-xs sm:text-base uppercase text-white truncate">
                        Air Force Day Challenge
                      </h3>
                      <p className="text-[0.65rem] sm:text-xs text-slate-300 mt-0.5">
                        Bib: IAFD-812503 · 3 km
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/50 px-2 sm:px-2.5 py-0.5 text-[0.6rem] sm:text-xs font-black uppercase tracking-wider text-amber-300 shrink-0">
                      <Clock className="h-3 w-3" /> Proof In Review
                    </span>
                  </div>

                  {/* Notice Placed Right Inside the Card */}
                  <div className="p-3 sm:p-4 bg-black/25">
                    <EventNoticeCard
                      eventTitle="Indian Air Force Day Virtual Challenge 2026"
                      endDateFormatted="30 October 2026"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: HOW IT LOOKS INSIDE THE UPLOAD DRAWER */}
              <div>
                <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-slate-400 mb-2 mt-4 px-1">
                  3. Inside Upload Proof Drawer (Before Submitting)
                </p>

                <div className="rounded-2xl border border-white/15 bg-[#14242a] p-3.5 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="h-4 w-4 text-[#e64833]" />
                    <h4 className="text-xs sm:text-sm font-black uppercase text-white">
                      Upload GPS Run Proof
                    </h4>
                  </div>

                  {/* Notice inside drawer */}
                  <EventNoticeCard
                    eventTitle="Indian Air Force Day Virtual Challenge 2026"
                    endDateFormatted="30 October 2026"
                  />

                  {/* Mock file picker */}
                  <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-4 text-center text-xs text-slate-400">
                    <UploadCloud className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                    <p className="text-[0.7rem] font-bold text-white">Upload Activity Screenshot</p>
                    <p className="text-[0.65rem] text-slate-400">Strava / Nike / Garmin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
