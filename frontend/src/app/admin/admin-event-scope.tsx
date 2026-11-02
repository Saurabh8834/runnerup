"use client";

import { Calendar, CheckCircle2, Clock, Filter, Globe, Lock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { formatInrFromPaise } from "../../lib/admin-api";
import { useAdminEventScope, EventScopeItem } from "./admin-event-context";

export type { EventScopeItem };

interface AdminEventScopeBarProps {
  events?: EventScopeItem[];
  selectedEventId?: string;
  onSelectEvent?: (eventId: string) => void;
  sectionName?: string;
  totalCount?: number;
  paidCount?: number;
  revenuePaise?: number;
  actions?: ReactNode;
  className?: string;
}

function formatDate(val?: string | Date): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminEventScopeBar({
  events: propEvents,
  selectedEventId: propSelectedEventId,
  onSelectEvent: propOnSelectEvent,
  sectionName,
  totalCount,
  paidCount,
  revenuePaise,
  actions,
  className = "",
}: AdminEventScopeBarProps) {
  const globalScope = useAdminEventScope();

  const events = propEvents && propEvents.length > 0 ? propEvents : globalScope.events;
  const selectedEventId = propSelectedEventId !== undefined ? propSelectedEventId : globalScope.selectedEventId;
  const onSelectEvent = propOnSelectEvent || globalScope.setSelectedEventId;

  // Only real official challenges (dummy seeded events permanently filtered out)
  const realEvents = events.filter((ev) => {
    const s = (ev.slug || "").toLowerCase();
    const t = (ev.title || "").toLowerCase();
    return s.includes("cancer") || s.includes("air-force") || t.includes("cancer") || t.includes("air force");
  });

  const isCombined = !selectedEventId || selectedEventId === "all";
  const activeEvent = !isCombined ? realEvents.find((e) => e.id === selectedEventId) : null;

  const isCancer = activeEvent?.slug?.includes("cancer") || activeEvent?.title?.toLowerCase()?.includes("cancer");
  const isAirForce = activeEvent?.slug?.includes("air-force") || activeEvent?.title?.toLowerCase()?.includes("air force");

  const startDateStr = formatDate(activeEvent?.startsAt);
  const endDateStr = formatDate(activeEvent?.endsAt);
  const proofCloseStr = formatDate(activeEvent?.proofClosesAt);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ── TOP EVENT SWITCHER TABS & SELECTOR ── */}
      <div className="rounded-2xl border border-(--line) bg-(--panel) p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted) mr-1 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3 text-(--sage)" /> Switch Event:
            </span>

            {/* Combined Tab */}
            <button
              type="button"
              onClick={() => onSelectEvent("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isCombined
                  ? "bg-(--sage) text-(--on-accent) shadow-sm"
                  : "border border-(--line) bg-(--panel-soft) text-(--muted) hover:border-(--sage)/30 hover:text-(--foreground)"
              }`}
            >
              <Globe className="h-3 w-3" />
              <span>All Events (Combined)</span>
            </button>

            {/* Primary Events Quick Tabs */}
            {realEvents.map((ev) => {
              const isSelected = selectedEventId === ev.id;
              const evIsCancer = ev.slug.includes("cancer") || ev.title.toLowerCase().includes("cancer");
              const evIsAirForce = ev.slug.includes("air-force") || ev.title.toLowerCase().includes("air force");
              const isOpen = ev.status === "OPEN";

              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onSelectEvent(ev.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-black shadow-sm"
                      : "border border-(--line) bg-(--panel-soft) text-(--muted) hover:border-amber-500/40 hover:text-(--foreground)"
                  }`}
                >
                  <span>{evIsCancer ? "🎗️" : evIsAirForce ? "🇮🇳" : "🏁"}</span>
                  <span className="truncate max-w-[200px]">{ev.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase ${
                      isOpen
                        ? isSelected
                          ? "bg-emerald-900 text-emerald-100"
                          : "bg-emerald-500/15 text-emerald-400"
                        : isSelected
                          ? "bg-zinc-800 text-zinc-300"
                          : "bg-zinc-500/15 text-zinc-400"
                    }`}
                  >
                    {isOpen ? "Active" : "Closed"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        </div>
      </div>

      {/* ── ISOLATED EVENT SCOPE BANNER WITH EVENT DATES ── */}
      {!isCombined && activeEvent ? (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[0.65rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-black">
                  {sectionName ? `${sectionName} Scope` : "Isolated Event Scope"}
                </span>
                <span
                  className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                    activeEvent.status === "OPEN"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30"
                  }`}
                >
                  {activeEvent.status === "OPEN" ? "🟢 Registration & Proof Active" : `⚪ Status: ${activeEvent.status}`}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-(--foreground) flex items-center gap-2">
                <span>{isCancer ? "🎗️" : isAirForce ? "🇮🇳" : "🏁"}</span>
                <span>{activeEvent.title}</span>
              </h2>

              {/* Event Dates & Proof Window */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--muted) pt-0.5">
                {startDateStr && endDateStr && (
                  <div className="flex items-center gap-1.5 text-(--foreground) font-medium">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    <span>
                      Challenge Dates: <strong>{startDateStr}</strong> – <strong>{endDateStr}</strong>
                    </span>
                  </div>
                )}
                {proofCloseStr && (
                  <div className="flex items-center gap-1.5 text-(--muted)">
                    <Clock className="h-3.5 w-3.5 text-amber-500/80" />
                    <span>
                      Proof Closes: <strong>{proofCloseStr}</strong>
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-amber-300/80 pt-1 flex items-center gap-1">
                <Lock className="h-3 w-3 shrink-0" />
                <span>
                  Strict Event Isolation Active: All counts, customer records, and data below belong exclusively to this event.
                </span>
              </p>
            </div>

            {/* Event Specific Quick KPI Badges */}
            {(totalCount !== undefined || revenuePaise !== undefined || paidCount !== undefined) && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {revenuePaise !== undefined && (
                  <div className="rounded-xl border border-amber-500/30 bg-black/40 px-3.5 py-2 text-center min-w-28">
                    <div className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-wider">
                      Event Revenue
                    </div>
                    <div className="text-base sm:text-lg font-black text-(--foreground) tabular-nums">
                      {formatInrFromPaise(revenuePaise)}
                    </div>
                  </div>
                )}
                {paidCount !== undefined && (
                  <div className="rounded-xl border border-emerald-500/30 bg-black/40 px-3.5 py-2 text-center min-w-24">
                    <div className="text-[0.65rem] font-bold text-emerald-400 uppercase tracking-wider">
                      Paid Orders
                    </div>
                    <div className="text-base sm:text-lg font-black text-emerald-400 tabular-nums">
                      {paidCount}
                    </div>
                  </div>
                )}
                {totalCount !== undefined && (
                  <div className="rounded-xl border border-(--line) bg-black/40 px-3.5 py-2 text-center min-w-24">
                    <div className="text-[0.65rem] font-bold text-(--muted) uppercase tracking-wider">
                      Total Records
                    </div>
                    <div className="text-base sm:text-lg font-black text-(--foreground) tabular-nums">
                      {totalCount}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-(--line) bg-(--panel-soft)/50 px-4 py-2.5 text-xs text-(--muted) flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-(--sage)" />
            <span>
              Showing combined records across <strong>All Events</strong>. Select a specific event above to isolate payments, registrations, and metrics.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
