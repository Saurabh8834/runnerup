"use client";

interface EventNoticeCardProps {
  eventTitle?: string;
  endDateFormatted?: string;
  endsAt?: string | Date;
  className?: string;
}

export function EventNoticeCard({
  eventTitle = "INDIAN AIR FORCE DAY VIRTUAL CHALLENGE 2026",
  endDateFormatted,
  endsAt,
  className = "",
}: EventNoticeCardProps) {
  let displayDate = endDateFormatted;
  if (!displayDate && endsAt) {
    try {
      displayDate = new Date(endsAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      displayDate = "30 October 2026";
    }
  }
  if (!displayDate) {
    displayDate = "30 October 2026";
  }

  return (
    <div
      className={`rounded-xl sm:rounded-2xl border border-white/10 bg-[#0d161d] p-3 sm:p-4 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all ${className}`}
    >
      {/* Top Header Row: LIVE UPDATE Badge + Event Title */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <span className="inline-flex items-center rounded-md bg-[#dc2626] px-2 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shrink-0 shadow-sm">
          LIVE UPDATE
        </span>
        <span className="text-amber-400 font-bold uppercase text-[11px] sm:text-xs tracking-wider min-w-0 truncate">
          {eventTitle.toUpperCase()}
        </span>
      </div>

      {/* Thin Horizontal Divider */}
      <div className="my-2 sm:my-2.5 border-t border-white/10" />

      {/* Body with Megaphone Emoji */}
      <p className="text-[11.5px] sm:text-xs text-slate-200 leading-relaxed">
        <span className="mr-1.5 inline-block text-xs" role="img" aria-label="announcement">
          📢
        </span>
        Activity proofs will be reviewed after the event ends on{" "}
        <strong className="text-white font-bold">{displayDate}</strong> to ensure fair
        rankings and accurate results. Finisher kits, including medals, will be dispatched
        after successful verification. Thank you for your patience!
      </p>
    </div>
  );
}
