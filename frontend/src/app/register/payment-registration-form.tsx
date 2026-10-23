"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  CreditCard,
  FileText,
  Headphones,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Sparkles,
  Tag,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Field, inputClass } from "../components/app-shell";
import { PhoneInput } from "../components/phone-input";
import { SearchableSelect } from "../components/searchable-select";
import { RazorpayTrustStrip } from "./payment-badges";
import { authHeaders, getApiUrl, readApiError, resilientFetch } from "../../lib/api";
import { cn } from "../../lib/cn";
import { INDIAN_STATES, normalizeIndianState } from "../../lib/indian-states";
import {
  asString,
  type FieldErrors,
  validateRegistrationForm,
} from "../../lib/validation";

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
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
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
  return <p className="mt-1.5 text-xs font-medium text-red-500">{message}</p>;
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
  const suffix = (input.clerkId ?? "run").slice(-5);
  return `pranav_singh`;
}

// Confetti Particle Explosion
function ConfettiOverlay() {
  const pieces = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    x: (i * 2.2) % 100,
    delay: (i % 8) * 0.1,
    size: 6 + (i % 8),
    color: ["#10b981", "#eab308", "#6366f1", "#ec4899", "#3b82f6"][i % 5],
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: "100vh",
            opacity: [1, 1, 0],
            rotate: 360 * (p.id % 2 === 0 ? 1 : -1),
          }}
          transition={{
            duration: 3 + (p.id % 3),
            delay: p.delay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            backgroundColor: p.color,
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
}



function PaymentRegistrationFormInner() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventFromQuery = searchParams.get("event")?.trim() ?? "";
  const distanceFromQuery = searchParams.get("distance")?.trim() ?? "";

  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "paid" | "error">("idle");
  const [message, setMessage] = useState("Complete the form and continue to secure checkout.");
  const [step, setStep] = useState<"details" | "payment">("details");
  const [savedPayload, setSavedPayload] = useState<Record<string, unknown> | null>(null);
  const [runnerPhone, setRunnerPhone] = useState("");
  const [countdown, setCountdown] = useState(0);
  const paidRef = useRef(false);
  const failedRef = useRef(false);
  const [events, setEvents] = useState<RegisterEventOption[]>(fallbackEvents);
  const [selectedEvent, setSelectedEvent] = useState(
    eventFromQuery || fallbackEvents[0].value,
  );
  const [selectedDistance, setSelectedDistance] = useState(distanceFromQuery || "");
  const [selectedActivity, setSelectedActivity] = useState("running");
  const [selectedTshirt, setSelectedTshirt] = useState("L");
  const [runnerName, setRunnerName] = useState("");
  const [runnerEmail, setRunnerEmail] = useState("");
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
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Active tracking refs for high-speed live payment polling
  const activeOrderIdRef = useRef<string | null>(null);
  const activeRegIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-load Razorpay checkout script on mount so it is ready instantly with zero button-click lag
  useEffect(() => {
    void loadRazorpayScript();
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // High-speed live verification: queries server to see if payment was captured on Razorpay
  // Completely unblocks mobile UPI users without waiting for slow iframe polling
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

  // Auto-detect payment completion when user switches back from UPI app (Google Pay / PhonePe)
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
          .map((row) => ({
            label: row.title,
            value: row.slug,
            amount: `₹${Math.round(row.priceInPaise / 100)}`,
            priceInPaise: row.priceInPaise,
            couponCode: row.couponCode ?? null,
            distances: row.distances?.length ? row.distances : ["5 km"],
            activityTypes: (row as { activityTypes?: string[] }).activityTypes ?? ["running"],
          }));

        if (cancelled || open.length === 0) return;
        setEvents(open);
        setSelectedEvent((prev) => {
          if (eventFromQuery && open.some((e) => e.value === eventFromQuery)) {
            return eventFromQuery;
          }
          return open.some((e) => e.value === prev) ? prev : open[0].value;
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

        // Only sync if not already synced in this session
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
        setRunnerName(data.name ?? user?.fullName ?? user?.firstName ?? "");
        setExistingRegs(data.registrations ?? []);
      } catch {
        // non-blocking
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn, user]);

  const activeEvent = useMemo(
    () => events.find((event) => event.value === selectedEvent) ?? events[0],
    [events, selectedEvent],
  );

  const distanceOptions = activeEvent?.distances ?? ["5 km"];
  const activityOptions = activeEvent?.activityTypes ?? ["running"];

  useEffect(() => {
    if (distanceFromQuery && distanceOptions.includes(distanceFromQuery)) {
      setSelectedDistance(distanceFromQuery);
      return;
    }
    if (!distanceOptions.includes(selectedDistance)) {
      setSelectedDistance(distanceOptions[0] ?? "");
    }
    if (!activityOptions.includes(selectedActivity)) {
      setSelectedActivity(activityOptions[0] ?? "running");
    }
  }, [distanceOptions, distanceFromQuery, selectedDistance, activityOptions, selectedActivity]);

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

  const handleCopyPromoCode = async (code?: string | null) => {
    if (!code) return;
    setCouponInput(code);
    setCouponError(null);

    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else if (typeof document !== "undefined") {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    } catch {
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }

    void applyCoupon(code);
  };

  const autoAppliedRef = useRef(false);
  useEffect(() => {
    const couponFromQuery = searchParams.get("coupon")?.trim();
    if (couponFromQuery && !autoAppliedRef.current && selectedEvent) {
      autoAppliedRef.current = true;
      setCouponInput(couponFromQuery.toUpperCase());
      void applyCoupon(couponFromQuery.toUpperCase());
    }
  }, [searchParams, selectedEvent]);

  const promoCode = activeEvent?.couponCode || "RUN50";
  const baseAmountInRupees = activeEvent?.priceInPaise
    ? Math.round(activeEvent.priceInPaise / 100)
    : parseInt((activeEvent?.amount || "₹499").replace(/\D/g, "") || "499", 10);
  const finalAmountInRupees = appliedCoupon
    ? Math.max(1, baseAmountInRupees - appliedCoupon.discountInRupees)
    : baseAmountInRupees;
  const selectedAmount = `₹${finalAmountInRupees}`;

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
      // ONLY successful paid registrations count as already registered.
      // Unpaid, pending, or failed attempts must NEVER block the user from retrying or completing payment.
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

  // Live Bib Number Generator Preview
  const previewBibNumber = useMemo(() => {
    const distNum = selectedDistance.match(/[0-9]+/)?.[0] || "5";
    return `MR-${distNum}K-${Math.floor(100 + (runnerName.length * 17) % 899)}`;
  }, [selectedDistance, runnerName]);

  function handleProceedToPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const rawState = (stateVal || asString(formData.get("state"))).trim();
    const stateValue = normalizeIndianState(rawState) || rawState;
    if (city) formData.set("city", city);
    if (stateValue) formData.set("state", stateValue);
    if (pincode) formData.set("pincode", pincode);
    if (selectedTshirt) formData.set("tshirtSize", selectedTshirt);

    const validationErrors = validateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const el = form.querySelector(`[name="${firstField}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setErrors({});

    const fullName = (asString(formData.get("name")) || runnerName || defaultName).trim();
    const phoneVal = (asString(formData.get("phone")) || runnerPhone || defaultPhone).trim();
    const emailVal = (asString(formData.get("email")) || runnerEmail || defaultEmail).trim();
    const streetAddr = (asString(formData.get("address")) || streetAddress).trim();
    const landmarkVal = asString(formData.get("landmark")).trim();
    const cityVal = (city || asString(formData.get("city"))).trim();
    const pincodeVal = (pincode || asString(formData.get("pincode"))).trim();

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

    setSavedPayload(payload);
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function triggerPayment() {
    if (!savedPayload) {
      setStep("details");
      return;
    }

    const payload: Record<string, unknown> = {
      ...savedPayload,
      couponCode: appliedCoupon?.code || undefined,
      distance: selectedDistance,
      eventSlug: selectedEvent,
    };

    setStatus("creating");
    setMessage("Generating secure Razorpay order...");
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
        // If auth still rejected (or not signed in), retry as guest without authorization header
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

      // Track registration in local state so user can resume seamlessly
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

      // If pre-generated order is included in registration response and matches discounted amount, use it immediately!
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
          // If auth still rejected (or not signed in), retry as guest without authorization header
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

      // Start high-frequency background polling (every 2s) so mobile users who pay via UPI (Google Pay, PhonePe, Paytm)
      // get INSTANT confirmation without being held up by the Razorpay iframe!
      stopPolling();
      pollIntervalRef.current = setInterval(() => {
        void checkLivePaymentStatus(order.orderId, registrationId);
      }, 2000);

      const checkout = new window.Razorpay!({
        key: order?.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TjmOBLaIqe8Kz0",
        amount: order?.amountInPaise ?? order?.amount,
        currency: order.currency ?? "INR",
        name: "RUNNERUP",
        description: `${activeEvent.label} · ${selectedDistance}`,
        image: "https://runnerup.in/icon.png",
        order_id: order.orderId,
        prefill: {
          name: (payload.name as string) || runnerName || defaultName,
          email: (payload.email as string) || runnerEmail || defaultEmail,
          contact: (payload.phone as string) || runnerPhone || defaultPhone,
        },
        theme: { color: "#e64833" },
        timeout: 600, // 10 minutes: prevents premature UPI session timeout during app-switch!
        retry: {
          enabled: true,
          max_count: 2,
        },
        send_sms_hash: true,
        handler: async (response: CheckoutResponse) => {
          stopPolling();
          paidRef.current = true;
          // INSTANT UX: Immediately display the confirmed bib and celebratory screen!
          // The user is never kept waiting on background network calls.
          setStatus("paid");
          setConfirmedBib(assignedBib);
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
            // Already optimistically confirmed; background reconciliation & webhooks ensure DB is in sync.
          }
        },
        modal: {
          confirm_close: true,
          ondismiss: async () => {
            if (paidRef.current) return;
            // Before reverting to idle, immediately check if the user completed payment in their UPI app!
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
        // Reset to idle so the user can immediately click Pay again to get a fresh, clean session!
        setStatus("idle");
        setMessage(err?.error?.description ?? "Payment could not be completed. Click below to retry with a fresh session.");
      });

      checkout.open();
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyErrorMessage(error));
    }
  }

  return (
    <>
      {/* Confetti Explosion & Celebration Modal on Payment Success */}
      {status === "paid" && (
        <>
          <ConfettiOverlay />
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full rounded-3xl border border-emerald-500/40 bg-(--panel) p-6 sm:p-8 text-center shadow-2xl"
            >
              <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl">
                🎉
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground">
                Payment & Registration Confirmed!
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-(--muted)">
                Welcome to {activeEvent.label}. Your race kit is locked in.
              </p>

              {/* Official Bib Pass */}
              <div className="mt-5 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 p-4">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-(--muted)">
                  Your Official Race Bib
                </p>
                <p className="mt-1 font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {confirmedBib || previewBibNumber}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-foreground">
                  <span>{runnerName || defaultName}</span>
                  <span>·</span>
                  <span>{selectedDistance}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  className="btn btn-primary w-full h-11 font-bold text-sm flex items-center justify-center gap-2"
                  href={`/prize/${confirmedBib || previewBibNumber}`}
                >
                  View Official Bib & Race Pass →
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link className="btn btn-secondary w-full h-10 text-xs font-semibold flex items-center justify-center" href="/leaderboard">
                    Live Leaderboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-secondary w-full h-10 text-xs font-semibold flex items-center justify-center cursor-pointer"
                  >
                    Save Entry Pass
                  </button>
                </div>
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center mt-1">
                  <p className="text-[0.72rem] text-emerald-300 font-medium">
                    ✅ Registration & payment complete! No account or sign-in needed. Confirmation sent to <strong>{runnerEmail || "your email"}</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {step === "payment" ? (
        /* ══════════════════════════════════════════════════════════════════
           STEP 2: AUTHENTIC SECURE PAYMENT PAGE (Matches Mockup 100%)
           ══════════════════════════════════════════════════════════════════ */
        <div className="max-w-4xl mx-auto py-2 sm:py-6">
          {/* Top Brand & Header Section */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 16.5l-4-4 1.41-1.41L11 15.67l6.59-6.59L19 10.5l-8 8z" />
                  </svg>
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  RunnerUp
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#fcf8f2] tracking-tight">
                Secure Payment
              </h1>
              <p className="text-sm sm:text-base text-[#90aead] mt-1">
                Your information is safe and protected.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-(--muted) hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Edit Details</span>
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Lock className="h-3.5 w-3.5" />
                <span>256-Bit SSL Encrypted</span>
              </span>
            </div>
          </div>

          {/* Two Balanced Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Order Summary */}
            <div className="rounded-3xl border border-[rgba(144,174,173,0.18)] bg-[#172c34] p-6 shadow-xl flex flex-col justify-between">
              <div>
                {/* Header with Document Icon */}
                <div className="flex items-center gap-3 border-b border-[rgba(144,174,173,0.14)] pb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#244855]/60 border border-[rgba(144,174,173,0.2)] text-cyan-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#fcf8f2]">Order Summary</h2>
                    <p className="text-xs text-[#90aead] line-clamp-1">{activeEvent.label}</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="py-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between text-[#fcf8f2]">
                    <span className="text-[#90aead]">Entry Fee ({selectedDistance || "5 km"})</span>
                    <span className="font-mono font-bold text-white">₹{baseAmountInRupees}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <Tag className="h-4 w-4" />
                      <span>Promo Discount</span>
                      {appliedCoupon && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {appliedCoupon.code}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      - ₹{appliedCoupon ? appliedCoupon.discountInRupees : 50}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#fcf8f2]">
                      <Truck className="h-4 w-4 text-cyan-400" />
                      <span>Pan-India Tracked Courier</span>
                    </div>
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                      FREE
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Payable Box */}
              <div>
                <div className="rounded-2xl bg-[#1e3b46] border border-[rgba(144,174,173,0.25)] p-4 sm:p-5 flex items-center justify-between shadow-inner">
                  <div>
                    <p className="text-sm sm:text-base font-bold text-white">Total Payable</p>
                    <p className="text-[11px] sm:text-xs text-[#90aead]">(All taxes &amp; delivery included)</p>
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight">
                    ₹{finalAmountInRupees}
                  </div>
                </div>

                {/* Delivery Recipient Pill */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-[11.5px] text-(--muted) border border-white/5">
                  <span className="line-clamp-1">
                    📍 Delivering to: <strong className="text-white">{runnerName || defaultName}</strong>, {city || "City"} ({pincode})
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer shrink-0 ml-2"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Trust Badges */}
            <div className="rounded-3xl border border-[rgba(144,174,173,0.18)] bg-[#172c34] p-6 shadow-xl flex flex-col justify-between gap-5">
              {/* 100% Secure Payments */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#fcf8f2]">100% Secure Payments</h3>
                  <p className="mt-0.5 text-xs text-[#90aead] leading-relaxed">
                    Your data is encrypted and protected with industry-standard security.
                  </p>
                </div>
              </div>

              {/* Multiple Payment Options */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#fcf8f2]">Multiple Payment Options</h3>
                  <p className="mt-0.5 text-xs text-[#90aead] leading-relaxed">
                    Pay via UPI (GPay, PhonePe, Paytm), Cards, Netbanking and more.
                  </p>
                </div>
              </div>

              {/* Pan-India Delivery */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#fcf8f2]">Pan-India Delivery</h3>
                  <p className="mt-0.5 text-xs text-[#90aead] leading-relaxed">
                    Get your solid metal finisher kit delivered to your doorstep.
                  </p>
                </div>
              </div>

              {/* Need Help? */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#fcf8f2]">Need Help?</h3>
                  <p className="mt-0.5 text-xs text-[#90aead] leading-relaxed">
                    Our support team is here for you at every step.
                  </p>
                  <a
                    href="https://wa.me/918287831071"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Chat on WhatsApp (+91 8287831071) →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="mt-8 space-y-4">
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
                  className="btn btn-secondary text-xs font-bold px-3 py-1.5 h-8 shrink-0 flex items-center gap-1.5 cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                >
                  {checkingStatus ? "Verifying..." : "Completed in UPI app? Verify Now →"}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => void triggerPayment()}
              disabled={status === "creating" || status === "paying" || distanceAlreadyTaken}
              className={cn(
                "w-full h-14 sm:h-15 rounded-full text-base sm:text-lg font-black tracking-wide flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer",
                distanceAlreadyTaken
                  ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 cursor-not-allowed opacity-75"
                  : "bg-gradient-to-r from-[#e64833] via-[#ff5e3a] to-[#d63b25] text-white shadow-[0_0_30px_rgba(230,72,51,0.65)] hover:shadow-[0_0_45px_rgba(230,72,51,0.9)] hover:brightness-110 active:scale-[0.99] border border-amber-300/40",
                (status === "creating" || status === "paying") && "opacity-85 pointer-events-none cursor-wait",
              )}
            >
              {status === "creating" ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Generating Razorpay Order...</span>
                </>
              ) : status === "paying" ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Processing with Razorpay...</span>
                </>
              ) : distanceAlreadyTaken ? (
                "Already Registered & Paid"
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span>Pay ₹{finalAmountInRupees} and Book Your Slot</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <RazorpayTrustStrip />

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="text-xs text-[#90aead] hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer"
              >
                ← Edit Athlete or Delivery Details
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
           STEP 1: ATHLETE & DELIVERY DETAILS
           ══════════════════════════════════════════════════════════════════ */
        <div>
          {/* Stepper Bar */}
          <div className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">1</span>
              <span>Athlete &amp; Delivery Details</span>
            </span>
            <span className="text-white/20">───</span>
            <button
              type="button"
              onClick={() => {
                if (savedPayload) setStep("payment");
              }}
              className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 text-(--muted) hover:text-white px-3.5 py-1 transition-colors cursor-pointer"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white font-bold text-[10px]">2</span>
              <span>Secure Payment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* ── LEFT COLUMN: REGISTRATION FORM ── */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleProceedToPayment}
                className="rounded-3xl border border-(--line) bg-(--panel) p-5 sm:p-7 shadow-xs space-y-4"
                noValidate
              >
                <div className="border-b border-(--line) pb-4">
                  <h2 className="text-lg font-black tracking-tight text-foreground">
                    Athlete Information
                  </h2>
                  <p className="text-xs text-(--muted)">
                    Enter your official race details for Bib &amp; Certificate generation.
                  </p>
                </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Full Name" required>
              <input
                aria-invalid={Boolean(errors.name)}
                autoComplete="name"
                className={inputClass}
                defaultValue={defaultName}
                onChange={(e) => setRunnerName(e.target.value)}
                name="name"
                placeholder="e.g. Pranav Singh"
                required
              />
              <FieldError message={errors.name} />
            </Field>

            <Field label="Phone Number" required>
              <PhoneInput defaultValue={defaultPhone} invalid={Boolean(errors.phone)} />
              <FieldError message={errors.phone} />
            </Field>

            <Field label="Email Address" required>
              <input
                aria-invalid={Boolean(errors.email)}
                autoComplete="email"
                className={inputClass}
                defaultValue={defaultEmail}
                onChange={(e) => setRunnerEmail(e.target.value)}
                name="email"
                placeholder="pranav@example.com"
                required
                type="email"
              />
              <FieldError message={errors.email} />
            </Field>

            <div>
              <span className="field-label">Username</span>
              <div className={`${inputClass} flex items-center gap-2 bg-(--panel-soft)`}>
                <span className="text-sm font-bold text-(--sage) select-none">@</span>
                <input
                  aria-label="Username"
                  autoComplete="username"
                  className="w-full bg-transparent font-medium text-foreground focus:outline-none placeholder:text-(--muted)"
                  name="username"
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().slice(0, 20);
                    setCustomUsername(clean);
                  }}
                  placeholder={autoUsername}
                  value={customUsername !== "" ? customUsername : autoUsername}
                />
              </div>
              <p className="mt-1 text-[0.65rem] text-(--muted)">
                Auto-assigned from your name · Editable for your race profile
              </p>
            </div>

            <Field label="Race Event" required>
              <select
                aria-invalid={Boolean(errors.eventSlug)}
                className={inputClass}
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
            </Field>

            <Field label="Distance Category" required>
              <select
                aria-invalid={Boolean(errors.distance)}
                className={inputClass}
                name="distance"
                onChange={(e) => setSelectedDistance(e.target.value)}
                required
                value={selectedDistance}
              >
                {distanceOptions.map((distance) => {
                  const taken = registeredKeys.has(`${selectedEvent}::${distance}`);
                  return (
                    <option disabled={taken} key={distance} value={distance}>
                      {distance} {taken ? "(Already Registered & Paid)" : ""}
                    </option>
                  );
                })}
              </select>
              <FieldError message={errors.distance} />
            </Field>
          </div>

          {/* T-Shirt Size Selector - Top 3 Finishers Only */}
          <div className="border-t border-(--line) pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-(--muted) flex items-center gap-1.5">
                <Shirt className="h-3.5 w-3.5 text-amber-500" /> Runner T-Shirt Size
              </span>
              <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                🏆 Top 3 Finishers Award
              </span>
            </div>
            <p className="text-[0.72rem] text-(--muted) mb-2.5">
              Select your size in case you finish in the <strong>Top 3 on the official leaderboard</strong> to receive your exclusive podium Dri-Fit T-Shirt!
            </p>
            <div className="grid grid-cols-5 gap-2">
              {TSHIRT_SIZES.map((t) => (
                <button
                  key={t.size}
                  type="button"
                  onClick={() => setSelectedTshirt(t.size)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl p-2 border transition-all cursor-pointer",
                    selectedTshirt === t.size
                      ? "border-amber-500 bg-amber-500/15 text-amber-400 font-black shadow-xs ring-2 ring-amber-500/30"
                      : "border-(--line) bg-(--panel-soft) text-(--muted) hover:text-foreground",
                  )}
                >
                  <span className="text-xs font-black">{t.size}</span>
                  <span className="text-[0.55rem]">{t.chest}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shipping Address with Instant Pincode Lookup */}
          <div className="border-t border-(--line) pt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-(--muted) flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-(--sage)" /> Medal Delivery Address
              </span>
              <span className="text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-semibold">
                Free Doorstep Courier
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Pincode (6-Digit)" required>
                <div className="relative">
                  <input
                    aria-invalid={Boolean(errors.pincode)}
                    autoComplete="postal-code"
                    className={inputClass}
                    inputMode="numeric"
                    maxLength={6}
                    name="pincode"
                    onChange={(e) => void handlePincodeChange(e.target.value)}
                    placeholder="e.g. 201301"
                    required
                    value={pincode}
                  />
                  {pincodeLoading && (
                    <RefreshCw className="absolute right-3 top-3 h-4 w-4 animate-spin text-(--muted)" />
                  )}
                  {pincodeSuccess && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <FieldError message={errors.pincode} />
              </Field>

              <Field label="City" required>
                <input
                  aria-invalid={Boolean(errors.city)}
                  autoComplete="address-level2"
                  className={inputClass}
                  name="city"
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Noida"
                  required
                  value={city}
                />
                <FieldError message={errors.city} />
              </Field>

              <Field label="State" required>
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
                  placeholder="e.g. Uttar Pradesh"
                  required
                  value={stateVal}
                />
                <FieldError message={errors.state} />
              </Field>
            </div>

            <Field label="Complete Street Address" required>
              <input
                aria-invalid={Boolean(errors.address)}
                autoComplete="street-address"
                className={inputClass}
                name="address"
                placeholder="Flat / House No., Building, Area"
                required
              />
              <FieldError message={errors.address} />
            </Field>
          </div>

          {/* Coupon Code Section */}
          <div className="rounded-2xl border border-(--line) bg-(--panel-soft) p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-amber-500" /> Have a Coupon Code?
              </span>

              {!appliedCoupon && Boolean(promoCode) && (
                <button
                  type="button"
                  onClick={() => void handleCopyPromoCode(promoCode)}
                  className="group flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-xs font-mono text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Click to copy and auto-apply coupon"
                >
                  <Sparkles className="h-3 w-3 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span className="font-bold tracking-wider">{promoCode}</span>
                  <span className="text-[11px] font-sans text-amber-400/90 font-semibold">(10% OFF · ₹50 Saved)</span>
                  <span className="ml-1 inline-flex items-center gap-1 rounded-md bg-amber-500/25 px-1.5 py-0.5 text-[10.5px] font-sans font-bold text-amber-200 group-hover:bg-amber-400 group-hover:text-amber-950 transition-colors">
                    {copiedCoupon ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400 group-hover:text-emerald-900" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </span>
                </button>
              )}
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-black">
                    ✓
                  </span>
                  <div>
                    <span className="font-mono font-bold text-emerald-300 uppercase">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-emerald-400 font-semibold ml-2">
                      (-₹{appliedCoupon.discountInRupees} OFF applied)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-(--input-bg) px-3 py-2 text-xs text-white uppercase placeholder:text-(--muted-soft) focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => void applyCoupon(couponInput)}
                  disabled={couponLoading || !couponInput.trim()}
                  className="btn btn-secondary h-9 px-4 text-xs font-bold rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer disabled:opacity-50"
                >
                  {couponLoading ? "Checking..." : "Apply"}
                </button>
              </div>
            )}

            {couponError && (
              <p className="text-[11.5px] text-rose-400 font-medium">{couponError}</p>
            )}
          </div>

          {/* Checkout Notice */}
          <div className="rounded-2xl border border-(--line) bg-(--panel-soft) p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-(--muted)">
              <Lock className="h-4 w-4 text-(--sage)" />
              <span>Instant UPI, Cards &amp; Netbanking with Razorpay</span>
            </div>
            <div className="text-right">
              {appliedCoupon ? (
                <div>
                  <span className="text-xs text-(--muted) line-through mr-2 font-mono">
                    {activeEvent.amount}
                  </span>
                  <span className="font-mono text-xl font-black text-emerald-400">
                    ₹{finalAmountInRupees}
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    ₹{appliedCoupon.discountInRupees} Saved!
                  </span>
                </div>
              ) : (
                <span className="font-mono text-lg font-black text-foreground">
                  {selectedAmount}
                </span>
              )}
            </div>
          </div>

          {status === "error" && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300 font-medium">
              {message}
            </div>
          )}

          {status === "paying" && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/15 p-3.5 text-xs text-amber-200 font-medium flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 animate-spin text-amber-400 shrink-0" />
                <span>
                  Waiting for bank & UPI authorization...
                </span>
              </div>
              <button
                type="button"
                onClick={() => void checkLivePaymentStatus()}
                disabled={checkingStatus}
                className="btn btn-secondary text-xs font-bold px-3 py-1.5 h-8 shrink-0 flex items-center gap-1.5 cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
              >
                {checkingStatus ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
                  </>
                ) : (
                  "Completed in UPI app? Verify Now →"
                )}
              </button>
            </div>
          )}

          {status === "idle" && message && message !== "Complete the form and continue to secure checkout." && (
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
              <span>✅ You are already registered & confirmed for {selectedDistance}. Check your bib in Athlete Dashboard.</span>
            </div>
          )}



          <button
            className={cn(
              "w-full h-13 rounded-full text-base font-black tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2",
              distanceAlreadyTaken
                ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 cursor-not-allowed opacity-75"
                : "bg-gradient-to-r from-[#e64833] via-[#ff5e3a] to-[#d63b25] text-white shadow-[0_0_28px_rgba(230,72,51,0.65)] hover:shadow-[0_0_45px_rgba(230,72,51,0.9)] hover:brightness-110 active:scale-[0.99] border border-amber-300/40 cursor-pointer",
            )}
            disabled={distanceAlreadyTaken}
            type="submit"
          >
            {distanceAlreadyTaken ? (
              "Already Registered"
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Continue to Secure Payment</span>
                <span className="font-mono text-amber-200">({selectedAmount})</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── RIGHT COLUMN: LIVE INTERACTIVE RACING BIB PREVIEW ── */}
      <div className="lg:col-span-5 space-y-4">
        <div className="sticky top-24 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--muted) flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Live Racing Bib Preview
          </p>

          {/* Virtual Race Bib Card */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-linear-to-b from-slate-900 via-slate-950 to-slate-950 p-6 text-white shadow-2xl">
            {/* Mountain Watermark */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -bottom-6 text-slate-800/40 text-9xl font-black select-none"
            >
              RUN
            </div>

            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <img
                  src="/runnerup-logo.png"
                  alt="RUNNERUP"
                  className="h-5 sm:h-6 w-auto object-contain"
                />
              </div>
              <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[0.6rem] font-black uppercase tracking-wider text-amber-400">
                OFFICIAL ATHLETE
              </span>
            </div>

            {/* Event Name & Category */}
            <div className="mt-4 text-center">
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider">
                {activeEvent.label}
              </p>
              {/* Massive Bib Code */}
              <p className="mt-2 font-mono text-5xl sm:text-6xl font-black tracking-tighter text-emerald-400 drop-shadow-md">
                {previewBibNumber}
              </p>
              <p className="mt-1 text-sm font-bold text-white uppercase tracking-widest">
                {runnerName || defaultName || "YOUR NAME"}
              </p>
            </div>

            {/* Bottom Kit Specs */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
              <div>
                <p className="text-[0.55rem] font-bold uppercase tracking-wider text-white/50">
                  DISTANCE
                </p>
                <p className="font-mono text-xs font-black text-white">{selectedDistance || "5 KM"}</p>
              </div>
              <div>
                <p className="text-[0.55rem] font-bold uppercase tracking-wider text-white/50">
                  TOP 3 T-SHIRT
                </p>
                <p className="font-mono text-xs font-black text-amber-400">{selectedTshirt} FIT</p>
              </div>
              <div>
                <p className="text-[0.55rem] font-bold uppercase tracking-wider text-white/50">
                  MEDAL KIT
                </p>
                <p className="font-mono text-xs font-black text-emerald-400">INCLUDED 🏅</p>
              </div>
            </div>
          </div>

          {/* Benefits Check List */}
          <div className="rounded-2xl border border-(--line) bg-(--panel) p-4 text-xs text-(--muted) space-y-2">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-(--sage)" /> What You Get With Your Entry:
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Heavy Finisher Metal Medal delivered to your doorstep</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>E-Certificate with QR verification code and official timing</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Ranked position on the RUNNERUP Official Leaderboard</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-sm shrink-0">🏆</span>
              <span className="text-amber-400 font-semibold">Podium Award: Custom Dri-Fit Performance T-Shirt for Top 3 Finishers</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
</>
);
}

export function PaymentRegistrationForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center rounded-2xl border border-(--line) bg-(--panel) px-4 py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-(--line-strong) border-t-(--sage)" />
            <p className="text-sm text-(--muted)">Loading registration...</p>
          </div>
        </div>
      }
    >
      <PaymentRegistrationFormInner />
    </Suspense>
  );
}
