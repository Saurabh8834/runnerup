"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CreditCard,
  FileText,
  Headphones,
  Lock,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Tag,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { SearchableSelect } from "../components/searchable-select";
import { PremiumTrustedBrandsCard } from "./payment-badges";
import { authHeaders, getApiUrl, readApiError, resilientFetch } from "../../lib/api";
import { cn } from "../../lib/cn";
import { INDIAN_STATES, normalizeIndianState } from "../../lib/indian-states";
import {
  asString,
  type FieldErrors,
  validateRegistrationForm,
} from "../../lib/validation";
import { trackFbEvent } from "../../lib/meta-pixel";

type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type RegisterEventOption = {
  label: string;
  value: string;
  amount: string;
  priceInPaise?: number;
  couponCode?: string | null;
  distances: string[];
  activityTypes?: string[];
};

type ExistingReg = {
  id: string;
  distance: string;
  status: string;
  bibNumber?: string;
  event: { slug: string; title: string };
  payment?: { status: string } | null;
};

const TSHIRT_SIZES = [
  { size: "S", chest: "38 in" },
  { size: "M", chest: "40 in" },
  { size: "L", chest: "42 in" },
  { size: "XL", chest: "44 in" },
  { size: "XXL", chest: "46 in" },
];

const fallbackEvents: RegisterEventOption[] = [
  {
    label: "National Cancer Awareness Day Virtual Challenge 2026",
    value: "national-cancer-awareness-day-virtual-run-2026",
    amount: "₹499",
    priceInPaise: 49900,
    distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
    activityTypes: ["running", "cycling", "walking"],
    couponCode: "VIP100",
  },
  {
    label: "Indian Air Force Day Virtual Challenge 2026",
    value: "indian-air-force-day-virtual-challenge",
    amount: "₹499",
    priceInPaise: 49900,
    distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
    activityTypes: ["running", "cycling", "walking"],
  },
  {
    label: "Monsoon Mountain Miles",
    value: "monsoon-mountain-miles",
    amount: "₹499",
    distances: ["3 km", "5 km", "10 km", "21 km"],
    activityTypes: ["running", "cycling", "walking"],
  },
  {
    label: "Independence Endurance Run",
    value: "independence-endurance-run",
    amount: "₹649",
    distances: ["5 km", "10 km", "25 km"],
    activityTypes: ["running", "cycling", "walking"],
  },
  {
    label: "Himalayan Winter Sprint",
    value: "himalayan-winter-sprint",
    amount: "₹399",
    distances: ["2 km", "5 km", "10 km"],
    activityTypes: ["running", "cycling", "walking"],
  },
];

async function loadRazorpayScript() {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;
  const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
  if (existing) {
    for (let i = 0; i < 20; i++) {
      if (window.Razorpay) return true;
      await new Promise((r) => setTimeout(r, 150));
    }
    if (window.Razorpay) return true;
  }
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return `Could not connect to the API at ${getApiUrl()}. Start backend with npm run dev.`;
  }
  const msg = error instanceof Error ? error.message : "Something went wrong";
  if (msg.toLowerCase().includes("authentication required")) {
    return "Session refreshed. Please click Pay again to proceed with checkout.";
  }
  return msg;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-rose-400">{message}</p>;
}

function deriveUsername(input: {
  clerkUsername?: string | null;
  dbUsername?: string | null;
  name?: string | null;
  email?: string | null;
  clerkId?: string | null;
}) {
  if (input.clerkUsername?.trim()) return input.clerkUsername.trim();
  if (input.dbUsername?.trim()) return input.dbUsername.trim();

  const name = input.name?.trim().toLowerCase() ?? "";
  if (name) {
    const base = name
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 18);
    if (base.length >= 2) return base;
  }

  const email = input.email?.trim().toLowerCase() ?? "";
  if (email.includes("@")) {
    const base = email
      .split("@")[0]
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 18);
    if (base.length >= 3) return base;
  }
  return "athlete_runner";
}

// Confetti Particle Explosion
function ConfettiOverlay() {
  const particles = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 800,
        y: -(Math.random() * 400 + 200),
        r: Math.random() * 360,
        scale: Math.random() * 0.8 + 0.4,
        color: [
          "#e64833",
          "#f7b600",
          "#10b981",
          "#38bdf8",
          "#a855f7",
          "#f43f5e",
        ][i % 6],
        duration: Math.random() * 1.5 + 1.8,
        delay: Math.random() * 0.2,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: p.scale, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y + 700,
            rotate: p.r + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
          className="absolute left-1/2 top-1/3 h-3 w-3 rounded-sm shadow-md"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

function PaymentRegistrationFormInner() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { getToken } = useAuth();
  const searchParams = useSearchParams();

  const eventFromQuery = searchParams.get("event")?.trim() ?? "";
  const distanceFromQuery = searchParams.get("distance")?.trim() ?? "";
  const rawActivityQuery = searchParams.get("activity")?.trim() ?? "";
  const activityFromQuery = ["running", "cycling", "walking"].includes(rawActivityQuery)
    ? rawActivityQuery
    : "running";
  const nameFromQuery = searchParams.get("name")?.trim() ?? "";
  const phoneFromQuery = searchParams.get("phone")?.trim() ?? "";
  const emailFromQuery = searchParams.get("email")?.trim() ?? "";

  const [events, setEvents] = useState<RegisterEventOption[]>(fallbackEvents);
  const [selectedEvent, setSelectedEvent] = useState(
    eventFromQuery || fallbackEvents[0].value,
  );
  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "paid" | "error">("idle");
  const [message, setMessage] = useState("Complete the steps below to secure your official race bib & medal.");
  const paidRef = useRef(false);
  const failedRef = useRef(false);

  const [selectedDistance, setSelectedDistance] = useState(distanceFromQuery || "5 km");
  const [selectedActivity, setSelectedActivity] = useState(
    rawActivityQuery ? activityFromQuery : "running",
  );
  const [selectedTshirt, setSelectedTshirt] = useState("L");
  const [runnerName, setRunnerName] = useState(nameFromQuery);
  const [runnerPhone, setRunnerPhone] = useState(phoneFromQuery);
  const [runnerEmail, setRunnerEmail] = useState(emailFromQuery);
  const [customUsername, setCustomUsername] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [existingRegs, setExistingRegs] = useState<ExistingReg[]>([]);
  const [dbUsername, setDbUsername] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");

  // Pincode auto-fill state
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  // Confetti and modal state
  const [confirmedBib, setConfirmedBib] = useState<string | null>(null);
  const [streetAddress, setStreetAddress] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Mobile drawer summary toggle
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Form & Section Refs
  const formRef = useRef<HTMLFormElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const pincodeInputRef = useRef<HTMLInputElement>(null);
  const streetInputRef = useRef<HTMLInputElement>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountInRupees: number;
    discountInPaise: number;
    finalAmountInRupees: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Active tracking refs for high-speed live payment polling
  const activeOrderIdRef = useRef<string | null>(null);
  const activeRegIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-load Razorpay checkout script on mount
  useEffect(() => {
    void loadRazorpayScript();
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const checkLivePaymentStatus = async (orderId?: string | null, regId?: string | null) => {
    const oId = orderId || activeOrderIdRef.current;
    const rId = regId || activeRegIdRef.current;
    if (!oId && !rId) return false;
    if (paidRef.current) return true;

    try {
      setCheckingStatus(true);
      const q = new URLSearchParams();
      if (oId) q.set("orderId", oId);
      if (rId) q.set("registrationId", rId);

      const res = await resilientFetch(`/api/payments/status?${q.toString()}`);
      if (!res.ok) return false;
      const json = await res.json();

      if (json.data?.paid) {
        paidRef.current = true;
        stopPolling();
        if (json.data.bibNumber) {
          setConfirmedBib(json.data.bibNumber);
        }
        setStatus("paid");
        if (rId) {
          setExistingRegs((prev) =>
            prev.map((r) =>
              r.id === rId
                ? { ...r, status: "CONFIRMED", payment: { status: "PAID" } }
                : r,
            ),
          );
        }
        return true;
      }
    } catch {
      // non-blocking
    } finally {
      setCheckingStatus(false);
    }
    return false;
  };

  useEffect(() => {
    async function handleVisibility() {
      if (document.visibilityState === "visible" && !paidRef.current) {
        if (activeOrderIdRef.current || activeRegIdRef.current) {
          const isPaid = await checkLivePaymentStatus();
          if (isPaid) return;
        }

        setTimeout(async () => {
          if (!paidRef.current && (activeOrderIdRef.current || activeRegIdRef.current)) {
            const isPaid = await checkLivePaymentStatus();
            if (!isPaid && status === "creating") {
              setStatus("idle");
            }
          }
        }, 1500);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      stopPolling();
    };
  }, [status]);

  // Load events
  useEffect(() => {
    let cancelled = false;
    async function loadOpenEvents() {
      try {
        const response = await resilientFetch("/api/events?scope=open");
        if (!response.ok) return;
        const json = await response.json();
        const rows = (json.data ?? []) as Array<{
          title: string;
          slug: string;
          distances: string[];
          priceInPaise: number;
          couponCode?: string | null;
          registrationOpen?: boolean;
        }>;

        const open = rows
          .filter((row) => row.registrationOpen !== false)
          .map((row) => {
            const rawActs = (row as { activityTypes?: string[] }).activityTypes;
            const actSet = new Set(
              Array.isArray(rawActs) && rawActs.length > 0
                ? rawActs
                : ["running", "cycling", "walking"],
            );
            actSet.add("running");
            actSet.add("cycling");
            actSet.add("walking");
            return {
              label: row.title,
              value: row.slug,
              amount: `₹${Math.round(row.priceInPaise / 100)}`,
              priceInPaise: row.priceInPaise,
              couponCode: row.couponCode ?? null,
              distances: row.distances?.length ? row.distances : ["5 km"],
              activityTypes: Array.from(actSet),
            };
          });

        if (cancelled) return;
        const hasCancerEvent = open.some((e) => e.value.includes("cancer"));
        const combined = hasCancerEvent ? open : [fallbackEvents[0], ...open];
        setEvents(combined);
        setSelectedEvent((prev) => {
          if (eventFromQuery && combined.some((e) => e.value === eventFromQuery || (eventFromQuery.includes("cancer") && e.value.includes("cancer")))) {
            const matched = combined.find((e) => e.value === eventFromQuery || (eventFromQuery.includes("cancer") && e.value.includes("cancer")));
            return matched ? matched.value : eventFromQuery;
          }
          return combined.some((e) => e.value === prev) ? prev : combined[0].value;
        });
      } catch {
        // keep fallback
      }
    }

    void loadOpenEvents();
    return () => {
      cancelled = true;
    };
  }, [eventFromQuery]);

  // Load user profile
  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;

    async function loadProfile() {
      try {
        const token = await getToken();
        if (!token || cancelled) return;

        const hasSynced = typeof window !== "undefined" && user?.id ? sessionStorage.getItem(`ru_synced_${user.id}`) : null;
        if (!hasSynced && user?.id) {
          await resilientFetch("/api/users/sync", {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({
              clerkId: user?.id,
              email: user?.primaryEmailAddress?.emailAddress,
              name: user?.fullName ?? user?.firstName,
              username: user?.username,
              phone: user?.primaryPhoneNumber?.phoneNumber,
              avatarUrl: user?.imageUrl,
            }),
          }).catch(() => null);
          if (typeof window !== "undefined") {
            try { sessionStorage.setItem(`ru_synced_${user.id}`, "1"); } catch {}
          }
        }

        const me = await resilientFetch("/api/users/me", {
          headers: authHeaders(token),
        });
        if (!me.ok || cancelled) return;
        const json = await me.json();
        const data = json.data as {
          name?: string;
          username?: string | null;
          registrations?: ExistingReg[];
        };
        setDbUsername(data.username ?? null);
        setProfileName(data.name ?? "");
        if (!runnerName) setRunnerName(data.name ?? user?.fullName ?? user?.firstName ?? "");
        if (!runnerEmail) setRunnerEmail(user?.primaryEmailAddress?.emailAddress ?? "");
        if (!runnerPhone) setRunnerPhone(user?.primaryPhoneNumber?.phoneNumber ?? "");
        setExistingRegs(data.registrations ?? []);
      } catch {
        // non-blocking
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn, user, runnerName, runnerEmail, runnerPhone]);

  const activeEvent = useMemo(
    () => events.find((event) => event.value === selectedEvent) ?? events[0],
    [events, selectedEvent],
  );

  const distanceOptions = activeEvent?.distances ?? ["1.5 km", "3 km", "5 km", "10 km", "21 km"];
  const activityOptions =
    activeEvent?.activityTypes?.length ? activeEvent.activityTypes : ["running", "cycling", "walking"];

  useEffect(() => {
    if (distanceFromQuery && distanceOptions.includes(distanceFromQuery)) {
      setSelectedDistance(distanceFromQuery);
      return;
    }
    if (!distanceOptions.includes(selectedDistance)) {
      setSelectedDistance(distanceOptions[0] ?? "5 km");
    }
  }, [distanceOptions, distanceFromQuery, selectedDistance]);

  useEffect(() => {
    if (rawActivityQuery && activityOptions.includes(activityFromQuery)) {
      setSelectedActivity(activityFromQuery);
      return;
    }
    if (!activityOptions.includes(selectedActivity)) {
      setSelectedActivity(activityOptions[0] ?? "running");
    }
  }, [activityOptions, activityFromQuery, rawActivityQuery, selectedActivity]);

  // Pincode auto-lookup handler
  async function handlePincodeChange(code: string) {
    const clean = code.replace(/\D/g, "").slice(0, 6);
    setPincode(clean);
    setPincodeSuccess(false);

    if (clean.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length) {
            const po = data[0].PostOffice[0];
            const detectedCity = po.District || po.Block || po.Circle;
            const detectedState = po.State;
            if (detectedCity) setCity(detectedCity);
            if (detectedState) {
              const matched = normalizeIndianState(detectedState);
              if (matched) setStateVal(matched);
              else setStateVal(detectedState);
            }
            setPincodeSuccess(true);
            setErrors((prev) => {
              if (!prev.pincode && !prev.city && !prev.state) return prev;
              const next = { ...prev };
              delete next.pincode;
              if (detectedCity) delete next.city;
              if (detectedState) delete next.state;
              return next;
            });
          }
        }
      } catch {
        // silent fail
      } finally {
        setPincodeLoading(false);
      }
    }
  }

  async function applyCoupon(codeToApply?: string) {
    const raw = (codeToApply ?? couponInput).trim().toUpperCase();
    if (!raw) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    // Instant local VIP100 fast-path
    if (raw === "VIP100") {
      setAppliedCoupon({
        code: "VIP100",
        discountInRupees: 100,
        discountInPaise: 10000,
        finalAmountInRupees: Math.max(1, baseAmountInRupees - 100),
      });
      setCouponInput("VIP100");
      setCouponLoading(false);
      return;
    }

    try {
      const res = await resilientFetch("/api/payments/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: raw,
          eventSlug: selectedEvent,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const serverMsg = json?.error?.message;
        if (serverMsg === "Route not found" || serverMsg === "Internal server error" || !serverMsg) {
          throw new Error("Invalid or expired coupon code");
        }
        throw new Error(serverMsg);
      }

      const json = await res.json();
      if (!json?.data?.valid) {
        throw new Error(json?.data?.message || "Invalid or expired coupon code");
      }

      setAppliedCoupon({
        code: json.data.code,
        discountInRupees: json.data.discountInRupees,
        discountInPaise: json.data.discountInPaise,
        finalAmountInRupees: json.data.finalAmountInRupees,
      });
      setCouponInput(json.data.code);
      setCouponError(null);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "Invalid or expired coupon code",
      );
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  const autoAppliedRef = useRef(false);
  useEffect(() => {
    const couponFromQuery = searchParams.get("coupon")?.trim();
    if (couponFromQuery && !autoAppliedRef.current && selectedEvent) {
      autoAppliedRef.current = true;
      setCouponInput(couponFromQuery.toUpperCase());
      void applyCoupon(couponFromQuery.toUpperCase());
    }
  }, [searchParams, selectedEvent]);

  const promoCode = (activeEvent?.couponCode && activeEvent.couponCode.trim()) || null;
  const baseAmountInRupees = activeEvent?.priceInPaise
    ? Math.round(activeEvent.priceInPaise / 100)
    : parseInt((activeEvent?.amount || "₹499").replace(/\D/g, "") || "499", 10);
  const finalAmountInRupees = appliedCoupon
    ? Math.max(1, baseAmountInRupees - appliedCoupon.discountInRupees)
    : baseAmountInRupees;

  const defaultName = profileName || user?.fullName || user?.firstName || "";
  const defaultEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const defaultPhone = user?.primaryPhoneNumber?.phoneNumber ?? "";
  const autoUsername = deriveUsername({
    clerkUsername: user?.username,
    dbUsername,
    name: runnerName || defaultName,
    email: runnerEmail || defaultEmail,
    clerkId: user?.id,
  });
  const username = customUsername || autoUsername;

  const registeredKeys = useMemo(() => {
    const set = new Set<string>();
    for (const reg of existingRegs) {
      if (reg.payment?.status === "PAID") {
        set.add(`${reg.event?.slug}::${reg.distance}`);
      }
    }
    return set;
  }, [existingRegs]);

  const distanceAlreadyTaken = Boolean(
    selectedEvent && selectedDistance && registeredKeys.has(`${selectedEvent}::${selectedDistance}`),
  );

  const pendingSame = Boolean(
    existingRegs.find(
      (r) =>
        r.event?.slug === selectedEvent &&
        r.distance === selectedDistance &&
        (r.status === "PENDING_PAYMENT" || r.payment?.status === "CREATED" || r.payment?.status === "FAILED") &&
        r.status !== "CONFIRMED" &&
        r.status !== "COMPLETED" &&
        r.payment?.status !== "PAID",
    ),
  );

  // ── Step Validation (Independent for Each Step) ──────────────────
  // Step 1: Athlete Details
  const isStep1Valid = useMemo(() => {
    const cleanName = (runnerName || defaultName).trim();
    const cleanPhone = (runnerPhone || defaultPhone).replace(/\D/g, "").slice(-10);
    const cleanEmail = (runnerEmail || defaultEmail).trim();
    return cleanName.length >= 2 && cleanPhone.length === 10 && cleanEmail.includes("@") && cleanEmail.includes(".");
  }, [runnerName, defaultName, runnerPhone, defaultPhone, runnerEmail, defaultEmail]);

  // Step 2: Category & Distance
  const isStep2Valid = useMemo(() => {
    return Boolean(selectedDistance);
  }, [selectedDistance]);

  // Step 3: Delivery Address
  const isStep3Valid = useMemo(() => {
    const cleanPin = pincode.replace(/\D/g, "");
    return cleanPin.length === 6 && Boolean(city.trim()) && Boolean(stateVal.trim()) && streetAddress.trim().length >= 4;
  }, [pincode, city, stateVal, streetAddress]);

  // Live Bib Number Generator Preview
  const previewBibNumber = useMemo(() => {
    const distNum = selectedDistance.match(/[0-9]+/)?.[0] || "5";
    return `MR-${distNum}K-${Math.floor(100 + ((runnerName || "RUNNER").length * 17) % 899)}`;
  }, [selectedDistance, runnerName]);

  async function handleDirectPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const fullName = (runnerName || defaultName || asString(formData.get("name"))).trim();
    const rawPhone = (runnerPhone || defaultPhone || asString(formData.get("phoneNumber")) || asString(formData.get("phone"))).trim();
    const phoneVal = rawPhone.replace(/\D/g, "").slice(-10);
    const emailVal = (runnerEmail || defaultEmail || asString(formData.get("email"))).trim();
    const rawState = (stateVal || asString(formData.get("state"))).trim();
    const stateValue = normalizeIndianState(rawState) || rawState;
    const cityVal = (city || asString(formData.get("city"))).trim();
    const pincodeVal = (pincode || asString(formData.get("pincode"))).trim();
    const streetAddr = (streetAddress || asString(formData.get("address"))).trim();
    const landmarkVal = asString(formData.get("landmark")).trim();

    if (fullName) formData.set("name", fullName);
    if (phoneVal) {
      formData.set("phone", phoneVal);
      formData.set("phoneNumber", phoneVal);
      formData.set("phoneCountry", "IN");
      formData.set("countryCode", "+91");
    }
    if (emailVal) formData.set("email", emailVal);
    if (selectedEvent) formData.set("eventSlug", selectedEvent);
    if (selectedDistance) formData.set("distance", selectedDistance);
    if (selectedActivity) formData.set("activityType", selectedActivity);
    if (selectedTshirt) formData.set("tshirtSize", selectedTshirt);
    if (cityVal) formData.set("city", cityVal);
    if (stateValue) formData.set("state", stateValue);
    if (pincodeVal) formData.set("pincode", pincodeVal);
    if (streetAddr) formData.set("address", streetAddr);

    const validationErrors = validateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const el = form.querySelector(`[name="${firstField}"]`) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof el.focus === "function") {
          el.focus();
        }
      } else if (firstField === "distance") {
        step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (firstField === "address" || firstField === "pincode" || firstField === "city" || firstField === "state") {
        step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setErrors({});

    setRunnerName(fullName);
    setRunnerEmail(emailVal);
    setRunnerPhone(phoneVal);
    setStreetAddress(streetAddr);
    setCity(cityVal);
    setStateVal(stateValue);
    setPincode(pincodeVal);

    const payload: Record<string, unknown> = {
      name: fullName,
      phone: phoneVal,
      email: emailVal,
      username: username || undefined,
      eventSlug: selectedEvent,
      distance: selectedDistance,
      activityType: selectedActivity,
      tshirtSize: selectedTshirt,
      shippingName: fullName,
      shippingPhone: phoneVal,
      shippingLine1: streetAddr,
      shippingLine2: landmarkVal || undefined,
      shippingCity: cityVal,
      shippingState: stateValue,
      shippingPincode: pincodeVal,
      address: streetAddr,
      city: cityVal,
      state: stateValue,
      pincode: pincodeVal,
      couponCode: appliedCoupon?.code || undefined,
    };

    setStatus("creating");
    setMessage("Connecting to secure Razorpay gateway...");
    paidRef.current = false;
    failedRef.current = false;

    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) throw new Error("Could not load payment gateway. Please check internet connection.");

      let token = isSignedIn ? await getToken() : null;

      let regRes = await resilientFetch("/api/registrations", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });

      if (regRes.status === 401) {
        if (isSignedIn) {
          const freshToken = await getToken({ skipCache: true });
          if (freshToken) {
            token = freshToken;
            regRes = await resilientFetch("/api/registrations", {
              method: "POST",
              headers: authHeaders(token),
              body: JSON.stringify(payload),
            });
          }
        }
        if (regRes.status === 401) {
          token = null;
          regRes = await resilientFetch("/api/registrations", {
            method: "POST",
            headers: authHeaders(null),
            body: JSON.stringify(payload),
          });
        }
      }

      if (!regRes.ok && (regRes.status >= 500 || regRes.status === 404)) {
        await new Promise((r) => setTimeout(r, 1200));
        regRes = await resilientFetch("/api/registrations", {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify(payload),
        });
      }

      if (!regRes.ok) throw new Error(await readApiError(regRes, "Registration could not be created"));
      const regJson = await regRes.json();
      const registrationId = regJson.data?.registration?.id ?? regJson.data?.id;
      const assignedBib =
        regJson.data?.registration?.bibNumber ||
        regJson.data?.bibNumber ||
        previewBibNumber;

      if (!registrationId) throw new Error("Invalid registration response from server");

      setExistingRegs((prev) => {
        const idx = prev.findIndex((r) => r.id === registrationId);
        const item: ExistingReg = {
          id: registrationId,
          distance: selectedDistance,
          status: "PENDING_PAYMENT",
          event: { slug: selectedEvent, title: activeEvent.label },
          payment: { status: "CREATED" },
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...item };
          return next;
        }
        return [...prev, item];
      });

      let order = regJson.data?.order;
      const expectedPaise = finalAmountInRupees * 100;
      if (order && Math.abs(order.amount - expectedPaise) > 100) {
        order = null;
      }

      if (!order) {
        let payRes = await resilientFetch("/api/payments/create-order", {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({
            registrationId,
            couponCode: appliedCoupon?.code || undefined,
          }),
        });

        if (payRes.status === 401) {
          if (isSignedIn) {
            const freshToken = await getToken({ skipCache: true });
            if (freshToken) {
              token = freshToken;
              payRes = await resilientFetch("/api/payments/create-order", {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({
                  registrationId,
                  couponCode: appliedCoupon?.code || undefined,
                }),
              });
            }
          }
          if (payRes.status === 401) {
            token = null;
            payRes = await resilientFetch("/api/payments/create-order", {
              method: "POST",
              headers: authHeaders(null),
              body: JSON.stringify({
                registrationId,
                couponCode: appliedCoupon?.code || undefined,
              }),
            });
          }
        }

        if (!payRes.ok && (payRes.status >= 500 || payRes.status === 404)) {
          payRes = await resilientFetch("/api/payments/create-order", {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({
              registrationId,
              couponCode: appliedCoupon?.code || undefined,
            }),
          });
        }

        if (!payRes.ok) throw new Error(await readApiError(payRes, "Payment order failed"));
        const payJson = await payRes.json();
        order = payJson.data;
      }

      activeOrderIdRef.current = order.orderId;
      activeRegIdRef.current = registrationId;

      setStatus("paying");
      setMessage("Complete payment in the Razorpay window...");

      stopPolling();
      let pollCount = 0;
      pollIntervalRef.current = setInterval(() => {
        pollCount++;
        if (pollCount > 50) {
          stopPolling();
          return;
        }
        if (typeof document !== "undefined" && document.hidden) return;
        void checkLivePaymentStatus(order.orderId, registrationId);
      }, 3500);

      const cleanContact = phoneVal.replace(/\D/g, "").slice(-10) || phoneVal;

      const checkout = new window.Razorpay!({
        key: order?.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TjmOBLaIqe8Kz0",
        amount: order?.amountInPaise ?? order?.amount,
        currency: order.currency ?? "INR",
        name: "RUNNERUP",
        description: `${activeEvent.label} · ${selectedDistance}`,
        image: "https://runnerup.in/icon.png",
        order_id: order.orderId,
        prefill: {
          name: fullName,
          email: emailVal,
          contact: cleanContact,
        },
        theme: { color: "#e64833" },
        timeout: 600,
        retry: {
          enabled: true,
          max_count: 2,
        },
        send_sms_hash: true,
        handler: async (response: CheckoutResponse) => {
          stopPolling();
          paidRef.current = true;
          setStatus("paid");
          setConfirmedBib(assignedBib);
          trackFbEvent("Purchase", {
            value: order.amount / 100,
            currency: "INR",
            content_name: activeEvent.label,
            content_category: selectedDistance,
          });
          setExistingRegs((prev) =>
            prev.map((r) =>
              r.id === registrationId
                ? { ...r, status: "CONFIRMED", payment: { status: "PAID" } }
                : r,
            ),
          );

          const freshToken = isSignedIn ? await getToken() : null;
          try {
            let verifyResponse = await resilientFetch("/api/payments/verify", {
              method: "POST",
              headers: authHeaders(freshToken),
              body: JSON.stringify(response),
            });

            if (verifyResponse.status === 401) {
              verifyResponse = await resilientFetch("/api/payments/verify", {
                method: "POST",
                headers: authHeaders(null),
                body: JSON.stringify(response),
              });
            }

            if (verifyResponse.ok) {
              const vJson = await verifyResponse.json();
              if (vJson.data?.bibNumber) {
                setConfirmedBib(vJson.data.bibNumber);
              }
            }
          } catch {
            // optimistic confirmation
          }
        },
        modal: {
          confirm_close: true,
          ondismiss: async () => {
            if (paidRef.current) return;
            const wasPaid = await checkLivePaymentStatus(order.orderId, registrationId);
            if (!wasPaid) {
              stopPolling();
              setStatus("idle");
              if (!failedRef.current) {
                setMessage("Payment paused. You can click below to complete your checkout anytime.");
              }
            }
          },
        },
      });

      checkout.on("payment.failed", (response: unknown) => {
        const err = response as { error?: { description?: string } };
        failedRef.current = true;
        stopPolling();
        setStatus("idle");
        setMessage(err?.error?.description ?? "Payment could not be completed. Click below to retry with a fresh session.");
      });

      checkout.open();
    } catch (err) {
      stopPolling();
      setStatus("error");
      setMessage(getFriendlyErrorMessage(err));
    }
  }

  // Handle direct payment submission from Desktop or Mobile CTA buttons
  const handleCtaClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    } else {
      const submitBtn = document.getElementById("main-payment-submit-btn");
      submitBtn?.click();
    }
  };

  return (
    <>
      {status === "paid" && <ConfettiOverlay />}

      {/* ── SUCCESS MODAL OVERLAY ────────────────────────── */}
      {status === "paid" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-[#0d141d] p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                ✓ Official Race Bib Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                You&apos;re Officially Registered!
              </h2>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                Welcome to <strong className="text-white">{activeEvent.label}</strong>. Your slot and solid metal finisher medal are reserved.
              </p>
            </div>

            {/* Official Digital Race Bib Card */}
            <div className="mx-auto max-w-xs rounded-2xl border-2 border-dashed border-amber-400/40 bg-gradient-to-b from-[#172c34] to-[#0f1f25] p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-2 right-2 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                OFFICIAL BIB
              </div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400 text-left">
                RUNNERUP VIRTUAL RUN
              </p>
              <div className="my-2 text-3xl font-black font-mono tracking-wider text-amber-400">
                {confirmedBib || previewBibNumber}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs text-left">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Athlete</span>
                  <span className="font-bold text-white break-words">{runnerName || defaultName || "Athlete"}</span>
                  {username && <span className="text-[10px] text-amber-400 font-mono block">@{username}</span>}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Category</span>
                  <span className="font-bold text-emerald-400">{selectedDistance}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="btn btn-primary h-12 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:brightness-110"
              >
                <span>Go to Athlete Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/events"
                className="btn btn-secondary h-12 px-6 rounded-full font-bold text-sm flex items-center justify-center border border-white/10 bg-white/5 text-slate-300 hover:text-white"
              >
                Explore More Events
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-4 pb-6 lg:pb-2">
        {/* Navigation & Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Challenges</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Lock className="h-3 w-3" />
            <span>256-Bit SSL Encrypted</span>
          </span>
        </div>

        {/* Clean, Focused Header */}
        <div className="border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Official Race Registration &amp; Checkout
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            {activeEvent.label}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Fill in your athlete details, select category, and complete checkout.
          </p>
        </div>

        {/* Mobile Quick Event & Price Card (Compact Instant Glance) */}
        <div className="lg:hidden flex items-center justify-between p-3.5 rounded-2xl bg-[#0d141d] border border-white/10 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
              🏅
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block tracking-wider">
                VIP Early Access
              </span>
              <span className="text-xs font-bold text-white truncate block">
                {selectedDistance} Heavy Finisher Medal Kit
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-xs text-slate-500 line-through font-mono">₹799</span>
              <span className="text-base font-black font-mono text-emerald-400">₹{finalAmountInRupees}</span>
            </div>
            <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Free Express Courier
            </span>
          </div>
        </div>

        {/* ── 3-STEP PROGRESS TRACKER (Interactive Navigation) ── */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#0d141d] border border-white/10 text-xs shadow-md">
          <button
            type="button"
            onClick={() => step1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center",
              isStep1Valid
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border border-white/10 text-white",
            )}
          >
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black bg-white/10 shrink-0">
              {isStep1Valid ? "✓" : "1"}
            </span>
            <span className="truncate">1. Athlete</span>
          </button>

          <button
            type="button"
            onClick={() => step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center",
              isStep2Valid
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border border-white/10 text-white",
            )}
          >
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black bg-white/10 shrink-0">
              {isStep2Valid ? "✓" : "2"}
            </span>
            <span className="truncate">2. Category</span>
          </button>

          <button
            type="button"
            onClick={() => step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center",
              isStep3Valid
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border border-white/10 text-white",
            )}
          >
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black bg-white/10 shrink-0">
              {isStep3Valid ? "✓" : "3"}
            </span>
            <span className="truncate">3. Delivery</span>
          </button>
        </div>

        {/* ── UNIFIED RESPONSIVE CHECKOUT FORM ────────────────── */}
        <form ref={formRef} onSubmit={handleDirectPayment} noValidate>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* ── LEFT COLUMN: 3 SEQUENTIAL STEPS ── */}
            <div className="lg:col-span-7 space-y-5">

              {/* ═════════════════════════════════════════════════════
                  STEP 1: ATHLETE INFORMATION (Clean Inputs, No Overlapping)
                  ═════════════════════════════════════════════════════ */}
              <div
                ref={step1Ref}
                className={cn(
                  "rounded-3xl border transition-all duration-300 bg-[#0d141d] p-5 sm:p-6 shadow-xl space-y-4",
                  isStep1Valid ? "border-emerald-500/30" : "border-white/10",
                )}
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shrink-0",
                      isStep1Valid ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300",
                    )}>
                      {isStep1Valid ? <Check className="h-4 w-4 stroke-[3]" /> : "1"}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-black text-white truncate">
                        1. Athlete Details
                      </h2>
                      <p className="text-[11px] text-slate-400 truncate">
                        For Digital Bib &amp; Certificate
                      </p>
                    </div>
                  </div>

                  {isStep1Valid ? (
                    <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="shrink-0 whitespace-nowrap text-[10.5px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                      Required
                    </span>
                  )}
                </div>

                <div className="space-y-3.5">
                  {/* Field 1: Full Name */}
                  <div>
                    <label className="text-[11.5px] font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Full Name</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      aria-invalid={Boolean(errors.name)}
                      autoComplete="name"
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-white/10 bg-[#14242a] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      value={runnerName || defaultName}
                      onChange={(e) => {
                        setRunnerName(e.target.value);
                        setErrors((prev) => {
                          if (!prev.name) return prev;
                          const next = { ...prev };
                          delete next.name;
                          return next;
                        });
                      }}
                      name="name"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                    <FieldError message={errors.name} />
                  </div>

                  {/* Field 2: Mobile / WhatsApp Number (Dedicated Full Row) */}
                  <div>
                    <label className="text-[11.5px] font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Mobile Number</span>
                      <span className="text-rose-400">*</span>
                      <span className="text-[10px] text-slate-400 ml-auto font-normal hidden sm:inline">(SMS &amp; WhatsApp updates)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="h-11 sm:h-12 px-3 rounded-xl bg-[#14242a] border border-white/10 text-xs sm:text-sm font-mono text-slate-300 flex items-center gap-1.5 shrink-0 select-none shadow-inner">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span className="font-bold">+91</span>
                      </div>
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        name="phone"
                        id="phone"
                        value={runnerPhone || defaultPhone}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setRunnerPhone(clean);
                          if (clean.length === 10) {
                            setErrors((prev) => {
                              if (!prev.phone) return prev;
                              const next = { ...prev };
                              delete next.phone;
                              return next;
                            });
                          }
                        }}
                        placeholder="10-digit mobile number"
                        className="flex-1 min-w-0 h-11 sm:h-12 px-3.5 rounded-xl border border-white/10 bg-[#14242a] text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                        required
                      />
                      <input type="hidden" name="phoneNumber" value={runnerPhone || defaultPhone} />
                      <input type="hidden" name="phoneCountry" value="IN" />
                    </div>
                    <FieldError message={errors.phone} />
                  </div>

                  {/* Field 3: Email Address (Dedicated Full Row) */}
                  <div>
                    <label className="text-[11.5px] font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>Email Address</span>
                      <span className="text-rose-400">*</span>
                      <span className="text-[10.5px] font-normal text-slate-400 ml-auto">(Race receipt &amp; bib delivery)</span>
                    </label>
                    <input
                      ref={emailInputRef}
                      aria-invalid={Boolean(errors.email)}
                      autoComplete="email"
                      type="email"
                      name="email"
                      value={runnerEmail || defaultEmail}
                      onChange={(e) => {
                        setRunnerEmail(e.target.value);
                        setErrors((prev) => {
                          if (!prev.email) return prev;
                          const next = { ...prev };
                          delete next.email;
                          return next;
                        });
                      }}
                      placeholder="e.g. rahul.sharma@example.com"
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-white/10 bg-[#14242a] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                    <FieldError message={errors.email} />
                  </div>

                  {/* Compact Username Pill */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-300">Profile Handle:</span>
                      <strong className="text-amber-400 font-mono">@{username}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400">Auto-linked</span>
                  </div>

                  {/* Race Event Dropdown */}
                  <div>
                    <label className="text-[11.5px] font-bold text-slate-300 block mb-1.5">
                      Race Event <span className="text-rose-400">*</span>
                    </label>
                    <select
                      aria-invalid={Boolean(errors.eventSlug)}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-white/10 bg-[#14242a] text-sm text-white focus:outline-none focus:border-amber-500"
                      name="eventSlug"
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      required
                      value={selectedEvent}
                    >
                      {events.map((event) => (
                        <option key={event.value} value={event.value}>
                          {event.label} ({event.amount})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ═════════════════════════════════════════════════════
                  STEP 2: RACE CATEGORY & DISCIPLINE (1-Tap Chips)
                  ═════════════════════════════════════════════════════ */}
              <div
                ref={step2Ref}
                className={cn(
                  "rounded-3xl border transition-all duration-300 bg-[#0d141d] p-5 sm:p-6 shadow-xl space-y-4",
                  isStep2Valid ? "border-emerald-500/30" : "border-white/10",
                )}
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shrink-0",
                      isStep2Valid ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300",
                    )}>
                      {isStep2Valid ? <Check className="h-4 w-4 stroke-[3]" /> : "2"}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-black text-white truncate">
                        2. Race Category
                      </h2>
                      <p className="text-[11px] text-slate-400 truncate">
                        Mode &amp; distance target
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-xs">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>GPS Verified</span>
                  </span>
                </div>

                {/* 1-Tap Pill Chips: Activity Mode */}
                <div>
                  <label className="text-[11.5px] font-bold text-slate-300 block mb-1.5">
                    Choose Activity Mode <span className="text-[10px] text-slate-400 font-normal">(All earn authentic solid metal medal)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "running", label: "🏃 Running" },
                      { id: "walking", label: "🚶 Walking" },
                      { id: "cycling", label: "🚴 Cycling" },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedActivity(id)}
                        className={cn(
                          "h-11 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center cursor-pointer border",
                          selectedActivity === id
                            ? "bg-[#ff4b26]/20 border-[#ff4b26] text-white shadow-md ring-1 ring-[#ff4b26]"
                            : "bg-[#14242a] border-white/10 text-slate-400 hover:text-white",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="activityType" value={selectedActivity} />
                </div>

                {/* 1-Tap Pill Chips: Distance Category */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11.5px] font-bold text-slate-300">
                      Select Distance Target <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10.5px] text-amber-400 font-mono">
                      Selected: <strong className="text-white">{selectedDistance}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {distanceOptions.map((dist) => {
                      const taken = registeredKeys.has(`${selectedEvent}::${dist}`);
                      const isSelected = selectedDistance === dist;
                      return (
                        <button
                          key={dist}
                          type="button"
                          disabled={taken}
                          onClick={() => {
                            setSelectedDistance(dist);
                            setErrors((prev) => {
                              if (!prev.distance) return prev;
                              const next = { ...prev };
                              delete next.distance;
                              return next;
                            });
                          }}
                          className={cn(
                            "h-12 rounded-xl text-xs sm:text-sm font-black transition-all flex flex-col items-center justify-center cursor-pointer border relative",
                            taken
                              ? "opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-slate-500"
                              : isSelected
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500"
                                : "bg-[#14242a] border-white/10 text-slate-300 hover:text-white hover:border-white/20",
                          )}
                        >
                          <span>{dist}</span>
                          {taken ? (
                            <span className="text-[8px] text-slate-400">Paid</span>
                          ) : isSelected ? (
                            <span className="text-[9px] text-emerald-400 font-sans font-bold">✓ Active</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" name="distance" value={selectedDistance} />
                  <FieldError message={errors.distance} />
                </div>

                {/* T-Shirt Size Selector - Top 3 Finishers Podium Award */}
                <div className="border-t border-white/10 pt-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11.5px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Shirt className="h-3.5 w-3.5 text-amber-400" /> Dri-Fit T-Shirt Size
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      🏆 Top 3 Finishers Award
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 mb-2">
                    Allocated if you finish on the podium for your category.
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {TSHIRT_SIZES.map((t) => (
                      <button
                        key={t.size}
                        type="button"
                        onClick={() => setSelectedTshirt(t.size)}
                        className={cn(
                          "h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer",
                          selectedTshirt === t.size
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-black shadow-md ring-1 ring-amber-500"
                            : "bg-[#14242a] border-white/10 text-slate-400 hover:text-white",
                        )}
                      >
                        <span className="text-xs font-black">{t.size}</span>
                        <span className="text-[8.5px] text-slate-400">{t.chest}</span>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="tshirtSize" value={selectedTshirt} />
                </div>
              </div>

              {/* ═════════════════════════════════════════════════════
                  STEP 3: MEDAL COURIER DELIVERY ADDRESS & COUPON
                  ═════════════════════════════════════════════════════ */}
              <div
                ref={step3Ref}
                className={cn(
                  "rounded-3xl border transition-all duration-300 bg-[#0d141d] p-5 sm:p-6 shadow-xl space-y-4",
                  isStep3Valid ? "border-emerald-500/30" : "border-white/10",
                )}
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shrink-0",
                      isStep3Valid ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300",
                    )}>
                      {isStep3Valid ? <Check className="h-4 w-4 stroke-[3]" /> : "3"}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-black text-white truncate">
                        3. Delivery Address
                      </h2>
                      <p className="text-[11px] text-slate-400 truncate">
                        Pan-India doorstep dispatch
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <Truck className="h-3 w-3 shrink-0" />
                    <span>Free Courier</span>
                  </span>
                </div>

                {/* Smart Pincode, City, State Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11.5px] font-bold text-slate-300 block mb-1.5">
                      Pincode (6-Digit) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={pincodeInputRef}
                        aria-invalid={Boolean(errors.pincode)}
                        autoComplete="postal-code"
                        className="w-full h-11 px-3.5 rounded-xl border border-white/10 bg-[#14242a] text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        inputMode="numeric"
                        maxLength={6}
                        name="pincode"
                        onChange={(e) => void handlePincodeChange(e.target.value)}
                        placeholder="e.g. 110001"
                        required
                        value={pincode}
                      />
                      {pincodeLoading && (
                        <RefreshCw className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-slate-400" />
                      )}
                      {pincodeSuccess && (
                        <CheckCircle2 className="absolute right-3 top-3.5 h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <FieldError message={errors.pincode} />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-slate-300 block mb-1.5">
                      City <span className="text-rose-400">*</span>
                    </label>
                    <input
                      aria-invalid={Boolean(errors.city)}
                      autoComplete="address-level2"
                      className="w-full h-11 px-3.5 rounded-xl border border-white/10 bg-[#14242a] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      name="city"
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      required
                      value={city}
                    />
                    <FieldError message={errors.city} />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-slate-300 block mb-1.5">
                      State <span className="text-rose-400">*</span>
                    </label>
                    <SearchableSelect
                      emptyMessage="No state found."
                      invalid={Boolean(errors.state)}
                      name="state"
                      onChange={(val) => {
                        setStateVal(val);
                        setErrors((prev) => {
                          if (!prev.state) return prev;
                          const next = { ...prev };
                          delete next.state;
                          return next;
                        });
                      }}
                      options={INDIAN_STATES}
                      placeholder="Select State"
                      required
                      value={stateVal}
                    />
                    <FieldError message={errors.state} />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="text-[11.5px] font-bold text-slate-300 block mb-1.5">
                    Complete Street Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    ref={streetInputRef}
                    aria-invalid={Boolean(errors.address)}
                    autoComplete="street-address"
                    className="w-full h-11 px-3.5 rounded-xl border border-white/10 bg-[#14242a] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    name="address"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Flat / House No., Apartment, Street, Landmark"
                    required
                  />
                  <FieldError message={errors.address} />
                </div>

                {/* Streamlined Coupon Code Box — Fixed Cutoff/Overlap UI */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-amber-400" /> Have a Coupon Code?
                      <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase">
                        Optional
                      </span>
                    </span>

                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer transition-colors"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                          ✓
                        </span>
                        <div>
                          <span className="font-mono font-bold text-emerald-300 uppercase tracking-wider">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-emerald-400 font-semibold ml-2">
                            (-₹{appliedCoupon.discountInRupees} OFF Applied)
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {promoCode ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              if (promoCode) {
                                setCouponInput(promoCode);
                                void applyCoupon(promoCode);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Tag className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="font-bold tracking-wider">{promoCode}</span>
                            <span className="text-[11px] text-emerald-400 font-sans font-semibold">· Tap to apply ₹100 OFF</span>
                          </button>
                        </div>
                      ) : null}

                      <div className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="Enter coupon or promo code"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          className="w-full h-11 pl-3.5 pr-22 rounded-xl border border-white/10 bg-[#14242a] text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 tracking-wider transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => void applyCoupon(couponInput)}
                          disabled={couponLoading || !couponInput.trim()}
                          className="absolute right-1 top-1 bottom-1 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-40 transition-colors shadow-sm"
                        >
                          {couponLoading ? "..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[11.5px] text-rose-400 font-medium">{couponError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: ORDER SUMMARY & PAYMENT PARTNERS ── */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
              {/* Card 1: Order Summary */}
              <div className="rounded-3xl border border-white/10 bg-[#0d141d] p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-cyan-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white">Order Summary</h2>
                    <p className="text-xs text-slate-400 line-clamp-1">{activeEvent.label}</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Entry Fee ({selectedDistance || "5 km"})</span>
                    <span className="font-mono font-bold text-white">₹{baseAmountInRupees}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <Tag className="h-3.5 w-3.5" />
                        <span>VIP Discount ({appliedCoupon.code})</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        - ₹{appliedCoupon.discountInRupees}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Pan-India Tracked Courier</span>
                    </div>
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                      FREE
                    </span>
                  </div>
                </div>

                {/* Total Payable Box */}
                <div className="rounded-2xl bg-[#14242a] border border-white/10 p-4 flex items-center justify-between shadow-inner">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">Total Payable</p>
                    <p className="text-[10.5px] text-slate-400">(All taxes &amp; delivery included)</p>
                  </div>
                  <div className="font-mono text-3xl font-black text-white tracking-tight">
                    ₹{finalAmountInRupees}
                  </div>
                </div>

                {/* Live Athlete & Bib Kit indicator */}
                <div className="flex items-start gap-2.5 rounded-xl bg-white/5 p-3 text-xs border border-white/5">
                  <span className="text-base shrink-0 leading-none">🏅</span>
                  <div className="min-w-0 flex-1 leading-snug">
                    <span className="text-slate-400 text-[11px] block">Medal &amp; Digital Bib Reserved For:</span>
                    <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                      <strong className="text-white font-bold text-xs sm:text-sm">
                        {runnerName || defaultName || "Registered Runner"}
                      </strong>
                      {username ? (
                        <span className="text-amber-400 font-mono text-[11px] font-semibold">
                          (@{username})
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Premium Trusted Payment Brands Card (Strictly Payment Gateways & Apps) */}
              <PremiumTrustedBrandsCard />

              {/* Card 3: Desktop Primary Action Button */}
              <div className="space-y-3 pt-1">
                {status === "error" && (
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300 font-medium">
                    {message}
                  </div>
                )}

                {status === "paying" && (
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-500/15 p-3.5 text-xs text-amber-200 font-medium flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className="h-4 w-4 animate-spin text-amber-400 shrink-0" />
                      <span>Waiting for bank &amp; UPI authorization...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void checkLivePaymentStatus()}
                      disabled={checkingStatus}
                      className="text-xs font-bold px-3 py-1.5 h-8 shrink-0 flex items-center gap-1.5 cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl"
                    >
                      {checkingStatus ? "Verifying..." : "Verify Now →"}
                    </button>
                  </div>
                )}

                {status === "idle" && message && message !== "Complete the steps below to secure your official race bib & medal." && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {pendingSame && !distanceAlreadyTaken && status !== "error" && status !== "creating" && status !== "paying" && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Previous payment was incomplete. Click below to complete your checkout and secure your race bib!</span>
                  </div>
                )}

                {distanceAlreadyTaken && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 font-bold flex items-center gap-2">
                    <span>✅ You are already registered &amp; confirmed for {selectedDistance}. Check your bib in Athlete Dashboard.</span>
                  </div>
                )}

                {/* Primary Payment Action Button */}
                <button
                  id="main-payment-submit-btn"
                  type="submit"
                  disabled={status === "creating" || status === "paying" || distanceAlreadyTaken}
                  className={cn(
                    "w-full h-14 sm:h-15 rounded-full text-base sm:text-lg font-black tracking-wide flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-xl",
                    distanceAlreadyTaken
                      ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 cursor-not-allowed opacity-75"
                      : "bg-gradient-to-r from-[#e64833] via-[#ff5e3a] to-[#d63b25] text-white shadow-[0_0_30px_rgba(230,72,51,0.65)] hover:shadow-[0_0_45px_rgba(230,72,51,0.9)] hover:brightness-110 active:scale-[0.99] border border-amber-300/40",
                    (status === "creating" || status === "paying") && "opacity-85 pointer-events-none cursor-wait",
                  )}
                >
                  {status === "creating" ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Generating Order...</span>
                    </>
                  ) : status === "paying" ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Processing Razorpay...</span>
                    </>
                  ) : distanceAlreadyTaken ? (
                    "Already Registered & Paid"
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Pay ₹{finalAmountInRupees} &amp; Book Slot</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>256-Bit SSL Encrypted · Instant Registration Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* ── MOBILE STICKY BOTTOM PAY BAR ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d141d]/95 backdrop-blur-xl border-t border-white/10 p-3 shadow-2xl">
          {/* Expandable Mini Summary Tray */}
          <AnimatePresence>
            {mobileSummaryOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-b border-white/10 pb-3 mb-2.5 text-xs space-y-1.5"
              >
                <div className="flex justify-between text-slate-300">
                  <span>Challenge Entry ({selectedDistance})</span>
                  <span className="font-mono text-white">₹{baseAmountInRupees}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>VIP Discount ({appliedCoupon.code})</span>
                    <span className="font-mono">-₹{appliedCoupon.discountInRupees}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Pan-India Courier</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3">
            {/* Price Side */}
            <div
              onClick={() => setMobileSummaryOpen((prev) => !prev)}
              className="cursor-pointer select-none"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-black text-white">
                  ₹{finalAmountInRupees}
                </span>
                {appliedCoupon && (
                  <span className="font-mono text-xs line-through text-slate-500">
                    ₹{baseAmountInRupees}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>View Details</span>
                {mobileSummaryOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              onClick={handleCtaClick}
              disabled={status === "creating" || status === "paying" || distanceAlreadyTaken}
              className={cn(
                "flex-1 h-12 rounded-full font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform",
                distanceAlreadyTaken
                  ? "bg-emerald-950 border border-emerald-500/40 text-emerald-300"
                  : "bg-gradient-to-r from-[#e64833] via-[#ff5e3a] to-[#d63b25] text-white shadow-[0_0_20px_rgba(230,72,51,0.7)]",
              )}
            >
              {status === "creating" || status === "paying" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : distanceAlreadyTaken ? (
                "Confirmed"
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Pay ₹{finalAmountInRupees} Now</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function PaymentRegistrationForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-[#0d141d] px-4 py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500" />
            <p className="text-xs text-slate-400">Loading race registration...</p>
          </div>
        </div>
      }
    >
      <PaymentRegistrationFormInner />
    </Suspense>
  );
}
