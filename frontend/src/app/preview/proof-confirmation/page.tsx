"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  UploadCloud,
  X,
  Trophy,
  ArrowRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function ProofConfirmationPreviewPage() {
  // Demo states to test both scenarios
  const [showModal, setShowModal] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Sample data simulating a real user (Jasvin R / Rohini)
  const sampleData = {
    runnerName: "Jasvin R",
    bibNumber: "2060",
    eventTitle: "National Cancer Awareness Day Virtual Challenge 2026",
    distance: "5 km",
    finishTime: "38m 50s",
    sourceApp: "Strava",
    submittedAt: "10 Nov 2026, 10:29 AM",
    imageUrl: "https://res.cloudinary.com/gpy6aiwy/image/upload/v1794330290/runnerup/proofs/olfughn0slypcdw4u0bd.jpg",
  };

  return (
    <div className="min-h-screen bg-[#14242a] text-white py-12 px-4 sm:px-6 relative isolate overflow-hidden">
      {/* Radiant ambient glow */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 -z-10 h-[400px] w-[700px] rounded-full bg-[#244855]/40 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 right-10 -z-10 h-[350px] w-[350px] rounded-full bg-[#e64833]/15 blur-[130px]" />

      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Top Control Bar for Sourav to Test States */}
        <div className="rounded-2xl border border-sky-400/40 bg-sky-950/40 p-4 sm:p-5 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-sky-500/20 border border-sky-400/50 px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-sky-300">
              Interactive Preview Lab
            </span>
            <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-white mt-1">
              Proof Upload Confirmation & Status Redesign
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Preview both the instant submission popup and the persistent "Proof Submitted & Saved" receipt card below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="rounded-full bg-[#e64833] hover:bg-[#ff573d] text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              🎉 Test Popup
            </button>
            <button
              onClick={() => setIsSubmitted(!isSubmitted)}
              className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Toggle: {isSubmitted ? "Submitted Mode ✅" : "Not Submitted Yet ⏳"}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PREVIEW PART 1: HOW THE DASHBOARD EVENT CARD LOOKS
        ═══════════════════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span>Preview: Athlete Dashboard Event Card</span>
              <span className="text-xs font-normal text-slate-400">
                ({isSubmitted ? "User has submitted proof" : "User hasn't submitted yet"})
              </span>
            </h2>
          </div>

          <div className="rounded-3xl sm:rounded-[28px] border border-white/15 bg-[#172c34]/90 overflow-hidden backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.6)]">
            
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-white/10 bg-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-black text-base sm:text-2xl uppercase tracking-tight text-white">
                    {sampleData.eventTitle}
                  </h3>
                  <span className="rounded-full bg-[#244855] border border-[#90aead]/40 px-2.5 py-0.5 font-mono text-[0.65rem] sm:text-xs font-bold text-[#fbe9d0]">
                    {sampleData.distance}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-mono font-bold text-white">Bib: {sampleData.bibNumber}</span>
                  <span>·</span>
                  <span>Joined 07 Nov 2026</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Paid ₹299
              </span>
            </div>

            {/* 4-Step Pipeline */}
            <div className="p-3.5 sm:p-6 border-b border-white/10 bg-black/20">
              <p className="text-[0.6rem] sm:text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                Event Progress Pipeline
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3.5">
                {/* Step 1 */}
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-2.5 sm:p-3.5 text-emerald-300">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 text-xs font-black">
                      1
                    </span>
                    <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider">Registration</span>
                  </div>
                  <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-slate-300 font-medium">Confirmed & Bib Assigned</p>
                </div>

                {/* Step 2 */}
                <div className={`rounded-2xl border p-2.5 sm:p-3.5 transition-all ${
                  isSubmitted
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-white/10 bg-white/[0.04] text-slate-300"
                }`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg text-xs font-black ${
                      isSubmitted ? "bg-emerald-500 text-slate-950" : "bg-white/10 text-slate-300"
                    }`}>
                      2
                    </span>
                    <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider">GPS Run Proof</span>
                  </div>
                  <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-slate-300 font-medium">
                    {isSubmitted ? "Submitted ✅ In Review" : "Upload Activity"}
                  </p>
                </div>

                {/* Step 3 */}
                <div className={`rounded-2xl border p-2.5 sm:p-3.5 transition-all ${
                  isSubmitted
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                    : "border-white/10 bg-white/[0.04] text-slate-300"
                }`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg text-xs font-black ${
                      isSubmitted ? "bg-amber-500 text-slate-950" : "bg-white/10 text-slate-300"
                    }`}>
                      3
                    </span>
                    <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider">Finish Time</span>
                  </div>
                  <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] font-mono font-bold text-white">
                    {isSubmitted ? sampleData.finishTime : "Pending Finish"}
                  </p>
                </div>

                {/* Step 4 */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-3.5 text-slate-300">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-white/10 text-slate-300 text-xs font-black">
                      4
                    </span>
                    <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider">Finisher Medal</span>
                  </div>
                  <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-slate-300 font-medium">
                    Dispatches Post-Event (15 Nov)
                  </p>
                </div>
              </div>
            </div>

            {/* ─── NEW: DEDICATED PROOF RECEIPT CARD (SOLVES USER CONFUSION) ─── */}
            {isSubmitted && (
              <div className="p-3.5 sm:p-5 pb-0 bg-white/[0.02]">
                <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-[#172c34] to-[#14242a] p-4 backdrop-blur-xl shadow-[0_0_20px_rgba(52,211,153,0.12)]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          Activity Proof Submitted & Saved
                        </h4>
                        <p className="text-[0.68rem] sm:text-xs text-slate-300">
                          Uploaded on {sampleData.submittedAt} · Stored safely in audit queue
                        </p>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-300">
                      <Clock className="h-3 w-3" /> In Arbiter Review Queue
                    </span>
                  </div>

                  <div className="mt-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Clickable Image Thumbnail with Zoom */}
                    <div
                      onClick={() => setLightboxImage(sampleData.imageUrl)}
                      className="group relative h-22 w-32 sm:h-24 sm:w-36 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-emerald-500/40 bg-black/50 shadow-md transition-all hover:border-emerald-300"
                      title="Click to view full screenshot"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sampleData.imageUrl}
                        alt="Activity Proof"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[0.65rem] font-black uppercase tracking-wider gap-1">
                        <Eye className="h-3.5 w-3.5" /> View Proof
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
                        <span className="text-slate-400">
                          Tracking App: <strong className="text-white">{sampleData.sourceApp}</strong>
                        </span>
                        <span className="text-slate-400">
                          Logged Time: <strong className="text-emerald-300 font-bold">{sampleData.finishTime}</strong>
                        </span>
                      </div>
                      <p className="text-[0.72rem] sm:text-xs text-slate-300 leading-relaxed">
                        ✅ <strong>You are all set!</strong> Your GPS activity screenshot is verified and queued for arbiter review. When the event window closes on <strong>15 November</strong>, our team verifies all results, and your official Finisher Certificate and 3D Medal will be prepared!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="p-3.5 sm:p-5 bg-white/[0.03] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-bold text-slate-200">
                  Event Details
                </span>
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-bold text-slate-200 inline-flex items-center gap-1">
                  Leaderboard <Trophy className="h-3 w-3 text-amber-400" />
                </span>
              </div>

              {/* Primary Action Button */}
              <div>
                {!isSubmitted ? (
                  <button
                    onClick={() => setFormOpen(!formOpen)}
                    className="neon-btn-blue w-full sm:w-auto rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="h-4 w-4" />
                    {formOpen ? "Close Uploader" : "Upload GPS Run Proof"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-300 backdrop-blur-xl shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Proof Submitted
                    </span>
                    <button
                      onClick={() => setFormOpen(!formOpen)}
                      className="rounded-full border border-white/20 bg-white/[0.08] hover:bg-white/15 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                      title="Update or change your activity screenshot"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {formOpen ? "Close" : "Update Proof"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* GPS Proof Submission Drawer (Simulated) */}
            {formOpen && (
              <div className="border-t border-white/15 bg-[#14242a]/95 p-5 sm:p-7 backdrop-blur-2xl">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                      <UploadCloud className="h-4 w-4 text-[#e64833]" />
                      {isSubmitted ? "Update / Replace GPS Proof" : "Submit GPS Proof for National Cancer Awareness Day Challenge"}
                    </h3>
                    <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-3 text-xs text-sky-200">
                    💡 <strong>Tip for mobile runners:</strong> Take a screenshot of your Strava, Nike, or Garmin run summary. Screenshots upload instantly in HD!
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Activity Screenshot (Strava / Nike / Garmin / Apple)
                    </span>
                    <div className="rounded-2xl border-2 border-dashed border-white/20 p-4 text-center bg-white/[0.02]">
                      <p className="text-xs text-slate-300 font-medium">Select photo or screenshot</p>
                      <p className="text-[0.65rem] text-slate-400 mt-1">Automatic mobile compression enabled (fast upload on 4G/5G)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        setFormOpen(false);
                        setIsSubmitted(true);
                        setShowModal(true);
                      }}
                      className="neon-btn-blue rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg cursor-pointer"
                    >
                      Submit Proof (Simulate)
                    </button>
                    <button
                      onClick={() => setFormOpen(false)}
                      className="rounded-full border border-white/20 bg-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PREVIEW PART 2: INSTANT SUBMISSION SUCCESS POPUP MODAL
        ═══════════════════════════════════════════════════════════════ */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-emerald-500/50 bg-[#172c34] p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(52,211,153,0.3),0_25px_60px_rgba(0,0,0,0.9)]">
              
              {/* Top ambient highlight strip */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400" />

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Celebratory Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.5)]">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>

              {/* Title & Event */}
              <div className="text-center mt-4">
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-emerald-300">
                  Submission Confirmed 🎉
                </span>
                <h3 className="mt-2 font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  GPS Proof Uploaded Successfully!
                </h3>
                <p className="mt-1 text-xs text-slate-300 font-medium">
                  {sampleData.eventTitle} ({sampleData.distance})
                </p>
              </div>

              {/* Summary Receipt Box */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Race Bib</span>
                  <span className="font-mono font-bold text-white text-sm">#{sampleData.bibNumber}</span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Recorded Finish Time</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">{sampleData.finishTime}</span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Source App</span>
                  <span className="font-bold text-white">{sampleData.sourceApp}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Audit Timeline</span>
                  <span className="font-bold text-amber-300">Audited Post-Event (15 Nov)</span>
                </div>
              </div>

              {/* Reassurance Message */}
              <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-[0.72rem] sm:text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Your activity screenshot is securely saved in our database. You don&apos;t need to take any further action until the event audit completes on <strong>15 November</strong>!
                </p>
              </div>

              {/* Primary Dismiss Button */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setShowModal(false)}
                  className="neon-btn-blue w-full justify-center rounded-full py-3 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-xl cursor-pointer"
                >
                  Got It! View On Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal for Full Image Zoom */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          >
            <div className="relative max-h-[90vh] max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-slate-950 p-2 shadow-2xl">
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 rounded-full bg-black/70 p-2 text-white hover:bg-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightboxImage} alt="Full Proof" className="max-h-[85vh] w-auto object-contain rounded-xl" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

