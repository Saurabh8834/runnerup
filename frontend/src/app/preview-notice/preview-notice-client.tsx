"use client";

import { useState } from "react";
import {
  Sparkles,
  Clock,
  UploadCloud,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { EventNoticeCard } from "../components/event-notice-card";

export function PreviewNoticeClient() {
  const [activeTab, setActiveTab] = useState<"card" | "dashboard" | "drawer">("card");

  return (
    <main className="min-h-screen bg-[#0c1316] text-slate-100 p-4 sm:p-8 font-sans flex flex-col items-center">
      <div className="w-full max-w-md space-y-4">
        {/* Top Header */}
        <div className="text-center pt-2 pb-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-sky-400">
            <Sparkles className="h-3.5 w-3.5" /> Mobile Live Preview
          </div>
          <h1 className="mt-2 text-lg sm:text-xl font-black uppercase tracking-tight text-white">
            Runner Notice Preview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            How this update appears to runners on smartphones
          </p>
        </div>

        {/* View Switcher Tabs (Ergonomic for mobile thumb) */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white/[0.06] border border-white/10 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("card")}
            className={`rounded-xl py-2 font-bold transition-all text-center cursor-pointer ${
              activeTab === "card"
                ? "bg-sky-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Card Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`rounded-xl py-2 font-bold transition-all text-center cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-sky-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            In Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("drawer")}
            className={`rounded-xl py-2 font-bold transition-all text-center cursor-pointer ${
              activeTab === "drawer"
                ? "bg-sky-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            In Drawer
          </button>
        </div>

        {/* Tab 1: Card Only (Direct Reference Match) */}
        {activeTab === "card" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <EventNoticeCard
              eventTitle="Indian Air Force Day Virtual Challenge 2026"
              endDateFormatted="30 October 2026"
            />
            <p className="text-center text-[0.7rem] text-slate-500 italic">
              Exact typography, borders, and spacing formatted for mobile
            </p>
          </div>
        )}

        {/* Tab 2: Inside Runner Dashboard Card */}
        {activeTab === "dashboard" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-white/15 bg-[#172c34]/95 overflow-hidden shadow-2xl backdrop-blur-2xl">
              {/* Event Header */}
              <div className="p-4 border-b border-white/10 bg-white/[0.04]">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[#244855] border border-[#90aead]/40 px-2.5 py-0.5 font-mono text-[0.65rem] font-bold text-[#fbe9d0]">
                    3 km Category
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/50 px-2.5 py-0.5 text-[0.65rem] font-black uppercase text-amber-300">
                    <Clock className="h-3 w-3" /> Proof Under Review
                  </span>
                </div>
                <h3 className="mt-2 font-black text-sm uppercase text-white leading-tight">
                  Indian Air Force Day Virtual Challenge 2026
                </h3>
                <p className="text-[0.7rem] text-slate-300 font-mono mt-1">
                  Bib: IAFD-812503 · Registered 26 Oct
                </p>
              </div>

              {/* Notice Embedded Directly Below */}
              <div className="p-3 bg-black/25">
                <EventNoticeCard
                  eventTitle="Indian Air Force Day Virtual Challenge 2026"
                  endDateFormatted="30 October 2026"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Inside GPS Proof Drawer */}
        {activeTab === "drawer" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-white/15 bg-[#14242a] p-4.5 space-y-3 shadow-2xl">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-[#e64833]" />
                <h3 className="text-xs font-black uppercase text-white">
                  Upload GPS Run Proof
                </h3>
              </div>

              {/* The Notice placed above the file uploader */}
              <EventNoticeCard
                eventTitle="Indian Air Force Day Virtual Challenge 2026"
                endDateFormatted="30 October 2026"
              />

              {/* Upload input simulation */}
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-4 text-center">
                <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1.5 opacity-60" />
                <p className="text-xs font-bold text-white">Upload Activity Screenshot</p>
                <p className="text-[0.7rem] text-slate-400 mt-0.5">Strava, Nike Run Club, Garmin</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
