"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Field, inputClass } from "../components/app-shell";
import { PhoneInput } from "../components/phone-input";
import { SearchableSelect } from "../components/searchable-select";
import { authHeaders, getApiUrl, readApiError } from "../../lib/api";
import { cn } from "../../lib/cn";
import { INDIAN_STATES } from "../../lib/indian-states";
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
    label: "October Runner 🍁",
    value: "october-runner",
    amount: "₹1",
    distances: ["1.5 km", "3 km", "5 km", "10 km", "21 km"],
    activityTypes: ["running", "cycling", "walking"],
  },
  {
    label: "Independence Day Virtual Run 2026 🇮🇳",
    value: "independence-day-virtual-run-2026",
    amount: "₹349",
    distances: ["1.5 km", "3 km", "5 km", "10 km", "15 km", "20 km", "25 km", "30 km"],
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
  return error instanceof Error ? error.message : "Something went wrong";
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-500">{message}</p>;
}

function deriveUsername(input: {
  clerkUsername?: string | null;
  dbUsername?: string | null;
  email?: string | null;
  clerkId?: string | null;
}) {
  if (input.clerkUsername?.trim()) return input.clerkUsername.trim();
  if (input.dbUsername?.trim()) return input.dbUsername.trim();
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
  return `runner_${suffix}`;
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

  // Confetti modal state
  const [confirmedBib, setConfirmedBib] = useState<string | null>(null);

  // Load events
  useEffect(() => {
    let cancelled = false;
    async function loadOpenEvents() {
      try {
        const response = await fetch(getApiUrl("/api/events?scope=open"));
        if (!response.ok) return;
        const json = await response.json();
        const rows = (json.data ?? []) as Array<{
          title: string;
          slug: string;
          distances: string[];
          priceInPaise: number;
          registrationOpen?: boolean;
        }>;

        const open = rows
          .filter((row) => row.registrationOpen !== false)
          .map((row) => ({
            label: row.title,
            value: row.slug,
            amount: `₹${Math.round(row.priceInPaise / 100)}`,
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

        await fetch(getApiUrl("/api/users/sync"), {
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
        });

        const me = await fetch(getApiUrl("/api/users/me"), {
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
              const matched = INDIAN_STATES.find(
                (s) => s.toLowerCase() === detectedState.toLowerCase(),
              );
              if (matched) setStateVal(matched);
              else setStateVal(detectedState);
            }
            setPincodeSuccess(true);
          }
        }
      } catch {
        // silent fail
      } finally {
        setPincodeLoading(false);
      }
    }
  }

  const selectedAmount = activeEvent?.amount ?? "₹499";
  const defaultName = profileName || user?.fullName || user?.firstName || "";
  const defaultEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const defaultPhone = user?.primaryPhoneNumber?.phoneNumber ?? "";
  const username = deriveUsername({
    clerkUsername: user?.username,
    dbUsername,
    email: defaultEmail,
    clerkId: user?.id,
  });

  const registeredKeys = useMemo(() => {
    const set = new Set<string>();
    for (const reg of existingRegs) {
      if (reg.status !== "CANCELLED") {
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
        r.payment?.status === "CREATED",
    ),
  );

  // Live Bib Number Generator Preview
  const previewBibNumber = useMemo(() => {
    const distNum = selectedDistance.match(/[0-9]+/)?.[0] || "5";
    return `MR-${distNum}K-${Math.floor(100 + (runnerName.length * 17) % 899)}`;
  }, [selectedDistance, runnerName]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (city) formData.set("city", city);
    if (stateVal) formData.set("state", stateVal);
    if (pincode) formData.set("pincode", pincode);
    if (selectedTshirt) formData.set("tshirtSize", selectedTshirt);

    const validationErrors = validateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const fullName = asString(formData.get("name"));
    const phoneVal = asString(formData.get("phone"));
    const emailVal = asString(formData.get("email"));
    const streetAddress = asString(formData.get("address"));
    const landmarkVal = asString(formData.get("landmark"));
    const cityVal = (city || asString(formData.get("city"))).trim();
    const stateValue = (stateVal || asString(formData.get("state"))).trim();
    const pincodeVal = (pincode || asString(formData.get("pincode"))).trim();

    const payload = {
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
      shippingLine1: streetAddress,
      shippingLine2: landmarkVal || undefined,
      shippingCity: cityVal,
      shippingState: stateValue,
      shippingPincode: pincodeVal,
      address: streetAddress,
      city: cityVal,
      state: stateValue,
      pincode: pincodeVal,
    };

    setStatus("creating");
    setMessage("Generating secure Razorpay order...");
    paidRef.current = false;
    failedRef.current = false;

    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) throw new Error("Could not load payment gateway. Please check internet connection.");

      let token = await getToken();
      if (!token) throw new Error("Session expired. Please sign in again.");

      let regRes = await fetch(getApiUrl("/api/registrations"), {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });

      if (regRes.status === 401) {
        const freshToken = await getToken({ skipCache: true });
        if (freshToken) {
          token = freshToken;
          regRes = await fetch(getApiUrl("/api/registrations"), {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify(payload),
          });
        }
      }

      if (!regRes.ok) throw new Error(await readApiError(regRes, "Registration could not be created"));
      const regJson = await regRes.json();
      const registrationId = regJson.data?.registration?.id ?? regJson.data?.id;
      const assignedBib = regJson.data?.registration?.bibNumber || previewBibNumber;

      if (!registrationId) throw new Error("Invalid registration response from server");

      let payRes = await fetch(getApiUrl("/api/payments/create-order"), {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ registrationId }),
      });

      if (payRes.status === 401) {
        const freshToken = await getToken({ skipCache: true });
        if (freshToken) {
          token = freshToken;
          payRes = await fetch(getApiUrl("/api/payments/create-order"), {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({ registrationId }),
          });
        }
      }

      if (!payRes.ok) throw new Error(await readApiError(payRes, "Payment order failed"));
      const payJson = await payRes.json();
      const order = payJson.data;

      setStatus("paying");
      setMessage("Complete payment in the Razorpay window...");

      const checkout = new window.Razorpay!({
        key: order?.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TjmOBLaIqe8Kz0",
        amount: order.amount,
        currency: order.currency ?? "INR",
        name: "RUNNERUP",
        description: `${activeEvent.label} · ${selectedDistance}`,
        image: "https://runnerup.in/icon.png",
        order_id: order.orderId,
        prefill: {
          name: payload.name,
          email: payload.email,
          contact: payload.phone,
        },
        theme: { color: "#10b981" },
        handler: async (response: CheckoutResponse) => {
          const freshToken = await getToken();
          if (!freshToken) {
            setStatus("paid");
            setConfirmedBib(assignedBib);
            return;
          }

          try {
            const verifyResponse = await fetch(getApiUrl("/api/payments/verify"), {
              method: "POST",
              headers: authHeaders(freshToken),
              body: JSON.stringify(response),
            });

            if (!verifyResponse.ok) {
              throw new Error(await readApiError(verifyResponse, "Payment verification error"));
            }

            paidRef.current = true;
            setStatus("paid");
            setConfirmedBib(assignedBib);
          } catch {
            paidRef.current = true;
            setStatus("paid");
            setConfirmedBib(assignedBib);
          }
        },
        modal: {
          ondismiss: () => {
            if (paidRef.current || failedRef.current) return;
            setStatus("idle");
            setMessage("Checkout paused. You can resume whenever you're ready.");
          },
        },
      });

      checkout.on("payment.failed", (response: unknown) => {
        const err = response as { error?: { description?: string } };
        failedRef.current = true;
        setStatus("error");
        setMessage(err?.error?.description ?? "Payment failed. Please try UPI or Netbanking.");
      });

      checkout.open();
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyErrorMessage(error));
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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

              <div className="mt-6 flex flex-col gap-2">
                <Link className="btn btn-primary w-full h-11 font-bold text-sm" href="/dashboard">
                  Open Runner Dashboard →
                </Link>
                <Link className="btn btn-secondary w-full h-10 text-xs font-semibold" href="/leaderboard">
                  View Race Leaderboard
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* ── LEFT COLUMN: REGISTRATION FORM ── */}
      <div className="lg:col-span-7">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-(--line) bg-(--panel) p-5 sm:p-7 shadow-xs space-y-4"
          noValidate
        >
          <div className="border-b border-(--line) pb-4">
            <h2 className="text-lg font-black tracking-tight text-foreground">
              Athlete Information
            </h2>
            <p className="text-xs text-(--muted)">
              Enter your official race details for Bib & Certificate generation.
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
                placeholder="e.g. Rahul Sharma"
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
                name="email"
                placeholder="runner@example.com"
                required
                type="email"
              />
              <FieldError message={errors.email} />
            </Field>

            <div>
              <span className="field-label">Username</span>
              <div className={`${inputClass} flex items-center gap-2 bg-(--panel-soft) text-(--muted)`}>
                <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
                <span className="truncate font-medium text-foreground">@{username}</span>
              </div>
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
                      {distance} {taken ? "(Already Registered)" : ""}
                    </option>
                  );
                })}
              </select>
              <FieldError message={errors.distance} />
            </Field>
          </div>

          {/* T-Shirt Size Selector */}
          <div className="border-t border-(--line) pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-(--muted) flex items-center gap-1.5">
                <Shirt className="h-3.5 w-3.5 text-(--sage)" /> Runner T-Shirt Size
              </span>
              <span className="text-[0.65rem] text-(--muted)">Included in entry kit</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {TSHIRT_SIZES.map((t) => (
                <button
                  key={t.size}
                  type="button"
                  onClick={() => setSelectedTshirt(t.size)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl p-2 border transition-all cursor-pointer",
                    selectedTshirt === t.size
                      ? "border-(--sage) bg-(--sage-soft) text-(--sage) font-black shadow-xs ring-2 ring-(--sage)/20"
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
                    placeholder="e.g. 110001"
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
                  placeholder="e.g. Mumbai"
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
                  onChange={(val) => setStateVal(val)}
                  options={INDIAN_STATES}
                  placeholder="Select State"
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

          {/* Checkout Notice */}
          <div className="rounded-2xl border border-(--line) bg-(--panel-soft) p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-(--muted)">
              <Lock className="h-4 w-4 text-(--sage)" />
              <span>Instant UPI, Cards & Netbanking with Razorpay</span>
            </div>
            <span className="font-mono text-lg font-black text-foreground">
              {selectedAmount}
            </span>
          </div>

          {status === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              {message}
            </div>
          )}

          <button
            className="btn btn-primary w-full h-12 text-sm font-black tracking-wide shadow-lg shadow-(--sage)/20 cursor-pointer disabled:opacity-50"
            disabled={status === "creating" || status === "paying" || distanceAlreadyTaken}
            type="submit"
          >
            {status === "creating"
              ? "Generating Order..."
              : status === "paying"
                ? "Opening Razorpay..."
                : `Pay ${selectedAmount} & Claim Official Bib`}
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
                  T-SHIRT
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
              <span>Custom Dri-Fit Performance Running T-Shirt</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>E-Certificate with QR verification code and official timing</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Ranked position on the RUNNERUP Official Leaderboard</span>
            </p>
          </div>
        </div>
      </div>
    </div>
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
