"use client";

import { Info } from "lucide-react";

interface EventNoticeCardProps {
  eventTitle?: string;
  endDateFormatted?: string;
  className?: string;
}

export function EventNoticeCard({
  eventTitle = "Indian Air Force Day Virtual Challenge 2026",
  endDateFormatted = "30 October 2026",
  className = "",
}: EventNoticeCardProps) {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border border-white/12 bg-[#1b2228] p-4.5 sm:p-6 text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all ${className}`}
    >
      {/* Header with Icon */}
      <div className="flex items-center gap-3 sm:gap-3.5">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 text-sky-400 shadow-sm">
          <Info className="h-5 w-5 sm:h-5.5 sm:w-5.5" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-sky-400 leading-snug">
            Important Event Update
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">
            {eventTitle}
          </p>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="my-3.5 sm:my-4 border-t border-white/10" />

      {/* Body Content */}
      <div className="space-y-3.5 sm:space-y-4 text-xs sm:text-sm">
        {/* Section 1: Activity Proof Verification */}
        <div>
          <h4 className="font-semibold text-white text-xs sm:text-sm">
            Activity Proof Verification
          </h4>
          <p className="mt-1 sm:mt-1.5 text-slate-300 leading-relaxed text-[0.8rem] sm:text-xs">
            Your submitted activity proof will be verified after the event ends on{" "}
            <strong className="text-white font-bold">{endDateFormatted}</strong>. Your
            proof status may remain pending until then.
          </p>
        </div>

        {/* Section 2: Finisher Kit Dispatch */}
        <div>
          <h4 className="font-semibold text-white text-xs sm:text-sm">
            Finisher Kit Dispatch
          </h4>
          <p className="mt-1 sm:mt-1.5 text-slate-300 leading-relaxed text-[0.8rem] sm:text-xs">
            Your finisher kit, including your medal, will be dispatched after the event
            ends and your activity proof has been successfully verified.
          </p>
        </div>

        {/* Closing Thank You */}
        <p className="pt-1 text-[0.75rem] sm:text-xs text-slate-400 leading-relaxed">
          Thank you for your patience and for being a part of RunnerUp!
        </p>
      </div>
    </div>
  );
}
