"use client";

import { useAuth } from "@clerk/nextjs";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminFetch, getFastAdminToken } from "../../lib/admin-api";

export type EventScopeItem = {
  id: string;
  title: string;
  slug: string;
  status?: string;
  startsAt?: string | Date;
  endsAt?: string | Date;
  proofClosesAt?: string | Date;
  priceInPaise?: number;
};

interface AdminEventContextValue {
  events: EventScopeItem[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  selectedEvent: EventScopeItem | null;
  isKinetic: boolean;
  isCancer: boolean;
  isAirForce: boolean;
  isCombined: boolean;
  loading: boolean;
  refreshEvents: () => Promise<void>;
}

const STORAGE_KEY = "ru_admin_active_event_id";

export const DEFAULT_REAL_EVENTS: EventScopeItem[] = [
  {
    id: "cmwh12lp60000dhrgnrnkiqfp",
    title: "Kinetic Run Virtual Challenge 2026",
    slug: "kinetic-run-virtual-challenge-2026",
    status: "OPEN",
    startsAt: "2026-12-10T00:00:00.000Z",
    endsAt: "2026-12-15T23:59:59.000Z",
    proofClosesAt: "2026-12-17T23:59:59.000Z",
  },
  {
    id: "cmvy7nj4o0000dhwgu9iwpjvq",
    title: "National Cancer Awareness Day Virtual Challenge 2026",
    slug: "national-cancer-awareness-day-virtual-run-2026",
    status: "OPEN",
    startsAt: "2026-11-07T00:00:00.000Z",
    endsAt: "2026-11-17T23:59:59.000Z",
    proofClosesAt: "2026-11-20T23:59:59.000Z",
  },
  {
    id: "cmuwyg5m20000dhi8ie9tlmec",
    title: "Indian Air Force Day Virtual Challenge 2026",
    slug: "indian-air-force-day-virtual-challenge",
    status: "CLOSED",
    startsAt: "2026-10-25T00:00:00.000Z",
    endsAt: "2026-10-30T23:59:59.000Z",
    proofClosesAt: "2026-11-01T23:59:59.000Z",
  },
];

const AdminEventContext = createContext<AdminEventContextValue | null>(null);

export function AdminEventProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [events, setEvents] = useState<EventScopeItem[]>(DEFAULT_REAL_EVENTS);
  const [selectedEventId, setSelectedEventIdState] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage safely on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setSelectedEventIdState(saved);
        }
      } catch {}
    }
  }, []);

  const setSelectedEventId = (id: string) => {
    const cleanId = id === "all" ? "" : id;
    setSelectedEventIdState(cleanId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, cleanId);
      } catch {}
    }
  };

  const loadEvents = async () => {
    try {
      const token = await getFastAdminToken(getToken, isSignedIn);
      const res = await adminFetch<{ data: EventScopeItem[] }>(
        "/api/admin/events?pageSize=100",
        token
      );
      const rawList = res.data || [];
      // Filter strictly to the 3 real official challenges (dummy seeded events permanently excluded)
      const filtered = rawList.filter((ev) => {
        const s = (ev.slug || "").toLowerCase();
        const t = (ev.title || "").toLowerCase();
        return (
          s.includes("kinetic") ||
          s.includes("cancer") ||
          s.includes("air-force") ||
          t.includes("kinetic") ||
          t.includes("cancer") ||
          t.includes("air force")
        );
      });
      // Merge with DEFAULT_REAL_EVENTS so all 3 official events (Kinetic, Cancer, IAF) are ALWAYS present
      const map = new Map<string, EventScopeItem>();
      DEFAULT_REAL_EVENTS.forEach((e) => map.set(e.slug, e));
      filtered.forEach((e) => map.set(e.slug, e));
      setEvents(Array.from(map.values()));
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, [getToken, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedEvent = useMemo(() => {
    if (!selectedEventId || selectedEventId === "all") return null;
    return (
      events.find(
        (e) =>
          e.id === selectedEventId ||
          e.slug === selectedEventId ||
          e.slug.toLowerCase().includes(selectedEventId.toLowerCase()),
      ) || null
    );
  }, [events, selectedEventId]);

  const isKinetic = useMemo(() => {
    if (!selectedEventId || selectedEventId === "all") return false;
    if (selectedEvent) {
      const s = (selectedEvent.slug || "").toLowerCase();
      const t = (selectedEvent.title || "").toLowerCase();
      return s.includes("kinetic") || t.includes("kinetic");
    }
    return selectedEventId.toLowerCase().includes("kinetic");
  }, [selectedEvent, selectedEventId]);

  const isCancer = useMemo(() => {
    if (!selectedEventId || selectedEventId === "all") return false;
    if (selectedEvent) {
      const s = (selectedEvent.slug || "").toLowerCase();
      const t = (selectedEvent.title || "").toLowerCase();
      return s.includes("cancer") || t.includes("cancer");
    }
    return selectedEventId.toLowerCase().includes("cancer");
  }, [selectedEvent, selectedEventId]);

  const isAirForce = useMemo(() => {
    if (!selectedEventId || selectedEventId === "all") return false;
    if (selectedEvent) {
      const s = (selectedEvent.slug || "").toLowerCase();
      const t = (selectedEvent.title || "").toLowerCase();
      return s.includes("air-force") || t.includes("air force");
    }
    return (
      selectedEventId.toLowerCase().includes("air-force") ||
      selectedEventId.toLowerCase().includes("airforce")
    );
  }, [selectedEvent, selectedEventId]);

  const isCombined = !selectedEventId || selectedEventId === "all";

  const value = useMemo(
    () => ({
      events,
      selectedEventId,
      setSelectedEventId,
      selectedEvent,
      isKinetic,
      isCancer,
      isAirForce,
      isCombined,
      loading,
      refreshEvents: loadEvents,
    }),
    [events, selectedEventId, selectedEvent, isKinetic, isCancer, isAirForce, isCombined, loading]
  );

  return (
    <AdminEventContext.Provider value={value}>
      {children}
    </AdminEventContext.Provider>
  );
}

export function useAdminEventScope(): AdminEventContextValue {
  const ctx = useContext(AdminEventContext);
  if (!ctx) {
    throw new Error("useAdminEventScope must be used within an AdminEventProvider");
  }
  return ctx;
}
