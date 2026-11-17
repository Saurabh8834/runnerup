import { cache } from "react";
import { getApiUrl } from "./api";
import type { PublicEvent } from "../app/data/events";
import { allPublicEvents, getEventBySlug } from "../app/data/events";

export type ApiEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  startsAt: string;
  endsAt: string;
  distances: string[];
  priceInPaise: number;
  paymentRequired?: boolean;
  medalIncluded?: boolean;
  featured?: boolean;
  phase?: "upcoming" | "live" | "past";
  registrationOpen?: boolean;
  city?: string | null;
  couponCode?: string | null;
  showCouponOnCard?: boolean;
  activityTypes?: string[];
  benefits?: string[];
  finishers?: number | null;
  verifiedResults?: number | null;
  cities?: number | null;
  resultNote?: string | null;
  bannerImageUrl?: string | null;
  _count?: { registrations: number };
  stats?: {
    registrations?: number;
    verifiedResults?: number;
    finishers?: number;
  };
};

function formatDateRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();

  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });
  const monthYear = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  if (sameMonth) {
    return `${day.format(start)}-${day.format(end)} ${monthYear.format(end)}`;
  }

  const full = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${full.format(start)} – ${full.format(end)}`;
}

function deriveCompareAtPrice(priceInPaise: number): string | undefined {
  if (!priceInPaise || priceInPaise <= 0) return undefined;
  const price = priceInPaise / 100;
  const raw = price * 1.71;
  const rounded = Math.max(Math.round(raw / 50) * 50, price + 100);
  return `Rs. ${rounded}`;
}

export function mapApiEventToPublic(
  event: ApiEvent,
  forcePhase?: "upcoming" | "past",
): PublicEvent {
  const title = event.title || (event as any).name || "";
  const isKineticRun =
    event.slug.includes("kinetic") ||
    title.toLowerCase().includes("kinetic");

  const isAirForce =
    event.slug.includes("air-force") ||
    title.toLowerCase().includes("air force") ||
    event.slug === "indian-air-force-day-2026" ||
    event.slug === "indian-air-force-day-virtual-challenge";

  const isCancerAwareness =
    event.slug.includes("cancer") ||
    title.toLowerCase().includes("cancer");

  const isPast =
    forcePhase === "past" ||
    isCancerAwareness ||
    event.phase === "past" ||
    event.registrationOpen === false ||
    ["COMPLETED", "CLOSED", "CANCELLED"].includes(event.status);

  const staticMatch =
    allPublicEvents.find((item) => item.slug === event.slug) ||
    (isKineticRun ? allPublicEvents.find((item) => item.slug.includes("kinetic")) : undefined) ||
    (isAirForce ? allPublicEvents.find((item) => item.slug.includes("air-force")) : undefined) ||
    (isCancerAwareness ? allPublicEvents.find((item) => item.slug.includes("cancer")) : undefined);

  const apiFinishers = event.stats?.finishers;
  const apiVerified = event.stats?.verifiedResults;

  const iafDescription = `🇮🇳 Indian Air Force Day Virtual Run 2026 ✈️\n\nRun with courage, rise with pride, and salute the heroes who guard our skies. Every kilometre is a tribute to their bravery and dedication.\n\nRun for Glory. Run for India. Jai Hind! 🇮🇳`;

  return {
    name: event.title,
    slug: event.slug,
    date: formatDateRange(event.startsAt, event.endsAt),
    distance: event.distances.join(" / "),
    price:
      !event.paymentRequired || event.priceInPaise <= 0
        ? "Free"
        : `Rs. ${Math.round(event.priceInPaise / 100)}`,
    description: isAirForce ? iafDescription : (event.description || staticMatch?.description || ""),
    highlight:
      staticMatch?.highlight ??
      (isPast
        ? "Completed · Tap to view recap and rewards."
        : isAirForce
        ? "Indian Air Force Day Virtual Challenge · Solid metal finisher medal & digital race bib included."
        : "Open for registration · Choose distance and join."),
    banner: staticMatch?.banner ?? (isAirForce ? "Air Force Day Virtual Challenge" : (isPast ? "Past race" : "Open event")),
    bannerImageUrl:
      event.bannerImageUrl ??
      staticMatch?.bannerImageUrl ??
      (isKineticRun ? "/images/kinetic-run-medal-front.webp" : undefined) ??
      (isCancerAwareness ? "/images/cancer-awareness-medal-front-4k.png" : undefined) ??
      (isAirForce ? "/images/event-medal.webp" : undefined),
    medalImageUrl:
      (event as { medalImageUrl?: string }).medalImageUrl ??
      staticMatch?.medalImageUrl ??
      (isKineticRun ? "/images/kinetic-run-medal-front.webp" : undefined) ??
      (isCancerAwareness ? "/images/cancer-awareness-medal-front-4k.png" : undefined) ??
      (isAirForce ? "/images/event-medal.webp" : undefined),
    reward:
      (isKineticRun
        ? "Die-Cast Solid Metal Finisher Medal + Digital Bib + Certificate"
        : undefined) ??
      (isCancerAwareness
        ? "Die-Cast Solid Metal Finisher Medal + Digital Bib + Certificate"
        : undefined) ??
      (isAirForce
        ? "100% Solid Metal Finisher Medal + Digital Race Bib + E-Certificate"
        : undefined) ??
      staticMatch?.reward ??
      (isPast ? "Medal + certificate" : "Solid Metal Finisher Medal + Digital Bib"),
    couponCode: event.couponCode ?? undefined,
    showCouponOnCard: event.showCouponOnCard ?? undefined,
    activityTypes:
      event.activityTypes?.length ? event.activityTypes : staticMatch?.activityTypes ?? ["running", "cycling", "walking"],
    benefits: event.benefits ?? staticMatch?.benefits ?? [],
    status:
      isKineticRun
        ? "upcoming"
        : isCancerAwareness
        ? "closed"
        : event.status === "CLOSED" || event.status === "closed"
        ? "closed"
        : isPast
        ? "past"
        : "upcoming",
    startsAt: event.startsAt ?? undefined,
    endsAt: event.endsAt ?? undefined,
    registrations: event.stats?.registrations ?? event._count?.registrations ?? undefined,
    compareAtPrice: isPast ? undefined : deriveCompareAtPrice(event.priceInPaise),
    finishers:
      event.finishers != null && event.finishers > 1000
        ? event.finishers
        : (staticMatch?.finishers ?? 1480),
    verifiedResults:
      event.verifiedResults != null && event.verifiedResults > 1000
        ? event.verifiedResults
        : (staticMatch?.verifiedResults ?? 1420),
    cities: event.cities != null && event.cities > 0 ? event.cities : (staticMatch?.cities ?? 54),
    resultNote: event.resultNote ?? staticMatch?.resultNote ?? undefined,
  };
}

/** Server or client: fetch one event by slug, fallback to static catalog. */
export const fetchEventBySlug = cache(async function fetchEventBySlug(slug: string): Promise<PublicEvent | null> {
  try {
    const response = await fetch(getApiUrl(`/api/events/${encodeURIComponent(slug)}`), {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const json = (await response.json()) as { data: ApiEvent };
      if (json.data) {
        return mapApiEventToPublic(json.data);
      }
    }
  } catch {
    // offline / API down
  }

  return getEventBySlug(slug) ?? null;
});

function deduplicateOpenEvents(list: PublicEvent[]): PublicEvent[] {
  const seenKeys = new Set<string>();
  const seenNames = new Set<string>();
  const result: PublicEvent[] = [];
  for (const ev of list) {
    const isAirForce =
      ev.slug.includes("air-force") ||
      ev.slug.includes("airforce") ||
      ev.slug === "iaf-2026" ||
      (ev.name && ev.name.toLowerCase().includes("air force"));
    const key = isAirForce ? "canonical-iaf-event" : ev.slug;
    const nameKey = ev.name ? ev.name.toLowerCase().trim().replace(/\s+/g, " ") : key;
    if (seenKeys.has(key) || seenNames.has(nameKey)) continue;
    seenKeys.add(key);
    seenNames.add(nameKey);
    result.push(ev);
  }
  return result;
}

/** Fetch open/upcoming events for home & previews. Featured first when set by admin. */
export const fetchOpenEvents = cache(async function fetchOpenEvents(options?: {
  homeFeaturedFirst?: boolean;
  limit?: number;
}): Promise<PublicEvent[]> {
  const limit = options?.limit;
  try {
    const response = await fetch(getApiUrl("/api/events?scope=open"), {
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const json = (await response.json()) as { data: ApiEvent[] };
      if (Array.isArray(json.data) && json.data.length > 0) {
        const rows = [...json.data];
        // Ensure Kinetic Run is included locally for preview & testing
        if (!rows.some((r) => r.slug.includes("kinetic"))) {
          rows.unshift({
            id: "kinetic-run-virtual-challenge-2026",
            title: "Kinetic Run Virtual Challenge 2026",
            slug: "kinetic-run-virtual-challenge-2026",
            description:
              "Turn your energy into unstoppable momentum. Challenge your limits across India, conquer your distance, and claim your exclusive 3D sculpted Kinetic Finisher Medal.",
            status: "OPEN",
            startsAt: "2026-12-10T00:00:00.000Z",
            endsAt: "2026-12-15T23:59:59.000Z",
            distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
            priceInPaise: 49900,
            paymentRequired: true,
            medalIncluded: true,
            featured: true,
            phase: "upcoming",
            registrationOpen: true,
            bannerImageUrl: "/images/kinetic-run-medal-front.webp",
          } as ApiEvent);
        }
        const openRows = rows.filter((r) => !r.slug.includes("cancer") && !r.slug.includes("air-force"));
        openRows.sort((a, b) => {
          const aKinetic = a.slug.includes("kinetic") ? 1 : 0;
          const bKinetic = b.slug.includes("kinetic") ? 1 : 0;
          if (aKinetic !== bKinetic) return bKinetic - aKinetic;
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        });
        const mapped = openRows.map((event) => mapApiEventToPublic(event, "upcoming"));
        const deduped = deduplicateOpenEvents(mapped);
        return limit != null ? deduped.slice(0, limit) : deduped;
      }
    }
  } catch {
    // fallback
  }

  const fallback = deduplicateOpenEvents(
    allPublicEvents.filter((event) => event.status === "upcoming"),
  );
  return limit != null ? fallback.slice(0, limit) : fallback;
});

export type HomeMoment = {
  id?: string;
  title: string;
  meta: string;
  image: string;
};

export type HomeTestimonial = {
  id?: string;
  name: string;
  role: string;
  city?: string | null;
  quote: string;
  rating: number;
};

export const fetchHomeContent = cache(async function fetchHomeContent(): Promise<{
  moments: HomeMoment[];
  testimonials: HomeTestimonial[];
}> {
  try {
    const response = await fetch(getApiUrl("/api/content/home"), {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const json = (await response.json()) as {
        data: { moments: HomeMoment[]; testimonials: HomeTestimonial[] };
      };
      return {
        moments: json.data?.moments ?? [],
        testimonials: json.data?.testimonials ?? [],
      };
    }
  } catch {
    // fallback empty → components use static defaults
  }
  return { moments: [], testimonials: [] };
});

export async function fetchGalleryContent(category?: string) {
  try {
    const qs = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    const response = await fetch(getApiUrl(`/api/content/gallery${qs}`), {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const json = await response.json();
      return (json.data ?? []) as Array<{
        id: string;
        title: string;
        event: string;
        location: string;
        date: string;
        category: string;
        image: string;
        meta?: string | null;
      }>;
    }
  } catch {
    // fallback
  }
  return null;
}
