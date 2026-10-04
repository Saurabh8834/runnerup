"use client";

import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Award, BadgeCheck, Clock, Copy, ExternalLink, Gift, Medal, Package, RefreshCw, Search, Shirt, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authHeaders, getApiUrl, readApiError } from "../../../lib/api";
import { PageShell } from "../../components/app-shell";

type PrizeStatus = "pending" | "processing" | "ready" | "sent" | "dispatched" | "delivered" | "not_eligible";

type PrizeItem = {
  type: string;
  name: string;
  icon: string;
  status: PrizeStatus;
  statusLabel: string;
  tracking?: { courier: string; number: string; url: string } | null;
  action?: { label: string; href: string } | null;
};

type TimelineStage = {
  stage: string;
  label: string;
  date: string | null;
  done: boolean;
};

type PrizeData = {
  runner: { name: string; bibNumber: string };
  event: { title: string; slug: string; distance: string };
  timeline: TimelineStage[];
  prizes: PrizeItem[];
};

const statusColors: Record<PrizeStatus, { bg: string; text: string; icon: string }> = {
  sent: { bg: "bg-(--sage-soft)", text: "text-(--sage)", icon: "#e64833" },
  ready: { bg: "bg-(--sage-soft)", text: "text-(--sage)", icon: "#e64833" },
  delivered: { bg: "bg-(--sage-soft)", text: "text-(--sage)", icon: "#e64833" },
  dispatched: { bg: "bg-[#874f41]/20", text: "text-[#fbe9d0]", icon: "#e64833" },
  processing: { bg: "bg-[#874f41]/20", text: "text-[#fbe9d0]", icon: "#e64833" },
  pending: { bg: "bg-(--panel-soft)", text: "text-(--muted-soft)", icon: "#90aead" },
  not_eligible: { bg: "bg-(--panel-soft)", text: "text-(--muted-soft)", icon: "#90aead" },
};

const prizeIcons: Record<string, typeof Award> = {
  certificate: Award,
  medal: Medal,
  tshirt: Shirt,
};

const stageIcons: Record<string, typeof Clock> = {
  registered: BadgeCheck,
  paid: BadgeCheck,
  proof_submitted: Clock,
  proof_approved: BadgeCheck,
  prizes: Truck,
};

function PrizeCard({ prize, index }: { prize: PrizeItem; index: number }) {
  const colors = statusColors[prize.status];
  const Icon = prizeIcons[prize.type] ?? Gift;

  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-(--line) bg-(--panel) transition-all duration-300 hover:shadow-md"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold text-(--foreground)">{prize.name}</p>
            <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
              {prize.statusLabel}
            </span>
          </div>

          {prize.tracking ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-(--panel-soft) px-3 py-2 text-xs">
              {prize.tracking.courier ? (
                <span className="text-(--muted)">
                  Courier: <span className="font-medium text-(--foreground)">{prize.tracking.courier}</span>
                </span>
              ) : null}
              <span className="text-(--muted)">
                Tracking: <span className="font-mono font-medium text-(--foreground)">{prize.tracking.number}</span>
              </span>
              {prize.tracking.url ? (
                <a
                  className="inline-flex items-center gap-1 text-(--sage) underline-offset-2 hover:underline"
                  href={prize.tracking.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Track <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          ) : null}

          {prize.action ? (
            <Link className={`btn mt-3 h-8 text-xs ${prize.action.href.startsWith("http") ? "btn-secondary" : "btn-primary"} cursor-pointer`} href={prize.action.href} {...(prize.action.href.startsWith("http") ? { rel: "noopener noreferrer", target: "_blank" } : {})}>
              {prize.action.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function Timeline({ stages }: { stages: TimelineStage[] }) {
  const doneCount = stages.filter((s) => s.done).length;
  const totalCount = stages.length;
  const progressPct = Math.round((doneCount / totalCount) * 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-soft)">Progress</p>
        <p className="text-xs tabular-nums text-(--muted)">
          {doneCount}/{totalCount} done
        </p>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-(--panel-soft)">
        <motion.div
          animate={{ width: `${progressPct}%` }}
          className="h-full rounded-full bg-gradient-to-r from-(--sage) to-emerald-500"
          initial={{ width: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="mt-5 grid grid-cols-5 gap-1 sm:gap-2">
        {stages.map((stage, i) => {
          const Icon = stageIcons[stage.stage] ?? Clock;
          return (
            <div key={stage.stage} className="flex flex-col items-center text-center">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all duration-500 ${
                stage.done
                  ? "bg-(--sage) text-white shadow-sm"
                  : "bg-(--panel-soft) text-(--muted-soft)"
              }`}>
                {stage.done ? <BadgeCheck className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <p className={`mt-1.5 text-[0.55rem] font-semibold uppercase leading-tight tracking-wider ${
                stage.done ? "text-(--sage)" : "text-(--muted-soft)"
              }`}>
                {stage.label.split(" ")[0]}
              </p>
              <p className="text-[0.45rem] text-(--muted-soft) leading-tight">
                {stage.done && stage.date ? new Date(stage.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PrizeBibPage() {
  const params = useParams<{ bibNumber: string }>();
  const bibNumber = decodeURIComponent(params.bibNumber ?? "");
  const { getToken } = useAuth();
  const [data, setData] = useState<PrizeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchBib, setSearchBib] = useState(bibNumber);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bibNumber) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const tokenPromise = getToken();
    const headers = async () => {
      const token = await tokenPromise;
      return token ? authHeaders(token) : { "Content-Type": "application/json" };
    };
    headers().then((h) => {
      fetch(getApiUrl(`/api/prizes/${encodeURIComponent(bibNumber)}`), { headers: h })
        .then(async (res) => {
          if (!res.ok) throw new Error(await readApiError(res, "Could not find this bib number"));
          return res.json() as Promise<{ data: PrizeData }>;
        })
        .then((json) => { setData(json.data); setLoading(false); })
        .catch((err) => { setError(err.message); setLoading(false); });
    });
  }, [bibNumber, getToken]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const v = searchBib.trim();
    if (v) window.location.href = `/prize/${encodeURIComponent(v)}`;
  }

  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-(--line)">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--sage) 14%, transparent) 0%, transparent 60%)",
              "var(--background)",
            ].join(", "),
          }}
        />
        <div className="container-page py-8 sm:py-10">
          <div className="mx-auto max-w-2xl">
            <form className="flex gap-2" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-soft)" />
                <input
                  autoComplete="off"
                  className="input h-12 w-full pl-10 text-base"
                  onChange={(e) => setSearchBib(e.target.value)}
                  placeholder="Enter bib number (e.g. MR-2026-0042)"
                  type="text"
                  value={searchBib}
                />
              </div>
              <button className="btn btn-primary h-12 shrink-0 cursor-pointer px-5" disabled={!searchBib.trim()} type="submit">
                Track
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-page">
          <div className="mx-auto max-w-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-(--line) bg-(--panel) py-16">
                <RefreshCw className="h-6 w-6 animate-spin text-(--muted-soft)" />
                <p className="mt-3 text-sm text-(--muted)">Looking up your prizes...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center rounded-2xl border border-(--line) bg-(--panel) px-6 py-12 text-center">
                <Search className="h-10 w-10 text-(--muted-soft)" />
                <p className="mt-4 text-sm font-semibold text-(--foreground)">No results found</p>
                <p className="mt-1 text-sm text-(--muted)">{error}</p>
                <p className="mt-4 text-xs text-(--muted-soft)">
                  Double-check your bib number or{" "}
                  <Link className="text-(--sage) underline-offset-2 hover:underline" href="/dashboard">go to dashboard →</Link>
                </p>
              </div>
            ) : data ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
                initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Runner info */}
                <div className="rounded-2xl border border-(--line) bg-(--panel) p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--sage-soft) text-(--sage)">
                        <Medal className="h-6 w-6" strokeWidth={1.75} />
                      </span>
                      <div>
                        <h1 className="text-xl font-bold tracking-tight text-(--foreground) sm:text-2xl">{data.runner.name}</h1>
                        <p className="mt-0.5 text-sm text-(--muted)">
                          {data.event.title} · {data.event.distance}
                        </p>
                        <p className="text-xs text-(--muted-soft)">
                          Bib: <span className="font-mono font-medium text-(--foreground)">{data.runner.bibNumber}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost h-8 shrink-0 cursor-pointer text-xs"
                      onClick={copyLink}
                      type="button"
                    >
                      {copied ? (
                        <><BadgeCheck className="h-3.5 w-3.5 text-(--sage)" /> Copied</>
                      ) : (
                        <><Copy className="h-3.5 w-3.5" /> Share</>
                      )}
                    </button>
                  </div>

                  <div className="mt-6">
                    <Timeline stages={data.timeline} />
                  </div>
                </div>

                {/* Prizes */}
                {data.prizes.length > 0 ? (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Gift className="h-4 w-4 text-(--sage)" />
                      <h2 className="text-sm font-bold text-(--foreground)">Prizes</h2>
                    </div>
                    <div className="space-y-3">
                      {data.prizes.map((prize, i) => (
                        <PrizeCard key={prize.type} index={i} prize={prize} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-2xl border border-dashed border-(--line) bg-(--panel-soft)/50 px-6 py-10 text-center">
                    <Package className="h-8 w-8 text-(--muted-soft)" />
                    <p className="mt-3 text-sm font-medium text-(--foreground)">No prizes yet</p>
                    <p className="mt-1 text-xs text-(--muted)">
                      Prizes will appear here after your proof is verified.
                    </p>
                    <Link className="btn btn-secondary mt-4 h-8 text-xs cursor-pointer" href={`/events/${data.event.slug}`}>
                      Event details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </motion.div>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
