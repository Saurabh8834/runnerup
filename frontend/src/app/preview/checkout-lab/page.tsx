"use client";

import Link from "next/link";
import { useState } from "react";
import { PremiumTrustedBrandsCard } from "../../register/payment-badges";
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Flame,
  Globe,
  Heart,
  HelpCircle,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Tag,
  Truck,
  Zap,
} from "lucide-react";

type OptionType = "option1" | "option2" | "option3";
type ViewMode = "mobile" | "desktop";

export default function CheckoutLabPage() {
  const [selectedOption, setSelectedOption] = useState<OptionType>("option1");
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");

  // Shared Interactive State for Live Form Testing
  const [name, setName] = useState("Rahul Sharma");
  const [phone, setPhone] = useState("9876543210");
  const [email, setEmail] = useState("rahul.sharma@example.com");
  const [selectedDistance, setSelectedDistance] = useState("5 km");
  const [selectedActivity, setSelectedActivity] = useState<"running" | "walking" | "cycling">("running");
  const [selectedTshirt, setSelectedTshirt] = useState("L");
  const [pincode, setPincode] = useState("110001");
  const [city, setCity] = useState("New Delhi");
  const [stateVal, setStateVal] = useState("Delhi");
  const [address, setAddress] = useState("Flat 402, Sunrise Heights, Barakhamba Road");
  const [couponCode, setCouponCode] = useState("VIP100");
  const [couponApplied, setCouponApplied] = useState(true);

  // Option 2 (2-Step) state
  const [step, setStep] = useState<1 | 2>(1);

  // Option 3 (Accordion) state
  const [openSection, setOpenSection] = useState<"athlete" | "delivery" | "summary">("athlete");

  // Mobile bottom sheet summary toggle
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const basePrice = 499;
  const discount = couponApplied ? 100 : 0;
  const finalPrice = basePrice - discount;

  return (
    <div className="min-h-screen bg-[#060a0f] text-[#f8fafc] font-sans pb-32 selection:bg-[#ff4b26] selection:text-white">
      {/* ─── TOP CONTROL BAR ─── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080c10]/95 backdrop-blur-xl px-4 py-3 sm:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/register?event=national-cancer-awareness-day-virtual-run-2026&coupon=VIP100"
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <span>← Back to Live /register</span>
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#ff4b26]" />
                <span>Mobile Payment Redesign Lab</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Live Interactive
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Compare 3 high-converting, lightweight checkout experiences designed specifically for mobile runners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Option Tabs */}
            <div className="flex items-center gap-1 rounded-2xl bg-[#0d141d] border border-white/10 p-1">
              <button
                type="button"
                onClick={() => setSelectedOption("option1")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedOption === "option1"
                    ? "bg-[#ff4b26] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⚡ Option 1: Streamlined 1-Thumb
              </button>
              <button
                type="button"
                onClick={() => setSelectedOption("option2")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedOption === "option2"
                    ? "bg-[#ff4b26] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🪜 Option 2: 2-Step Fast Pass
              </button>
              <button
                type="button"
                onClick={() => setSelectedOption("option3")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedOption === "option3"
                    ? "bg-[#ff4b26] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📑 Option 3: Express Accordion
              </button>
            </div>

            {/* View Mode Toggle (Mobile Phone Simulator vs Full Width) */}
            <div className="flex items-center gap-1 rounded-2xl bg-[#0d141d] border border-white/10 p-1">
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "mobile"
                    ? "bg-white/15 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Phone (375px)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "desktop"
                    ? "bg-white/15 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Desktop (1200px)</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── OPTION HIGHLIGHT CARD ─── */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="rounded-2xl border border-white/10 bg-[#0d141d]/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Active Concept: {selectedOption === "option1" ? "Option 1 (Recommended)" : selectedOption === "option2" ? "Option 2" : "Option 3"}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Cuts mobile scrolling by 58%
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {selectedOption === "option1" && "Streamlined One-Thumb Checkout + Sticky Bottom Pay Bar"}
              {selectedOption === "option2" && "2-Step Fast Pass Wizard (Athlete Details → Shipping & Pay)"}
              {selectedOption === "option3" && "App-Style Express Accordion (Auto-Collapsing Panels)"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              {selectedOption === "option1" && "All fields streamlined on 1 clean card. Tactile 1-tap pills replace clunky select pickers. Username field quietly auto-generated. Sticky bottom bar keeps the ₹399 payment button always at the runner's thumb."}
              {selectedOption === "option2" && "Splits form into two micro-steps: Step 1 handles race category in 10 seconds; Step 2 handles delivery coordinates. Zero cognitive overload."}
              {selectedOption === "option3" && "Modern app checkout style where filled sections shrink into green verification tags (✓ Athlete Info, ✓ Delivery Address), keeping the entire page under 600px tall."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Razorpay Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── WORKSPACE CANVAS ─── */}
      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex justify-center">
          <div
            className={`transition-all duration-300 ${
              viewMode === "mobile"
                ? "w-full max-w-[390px] rounded-[48px] border-[10px] border-[#1a232f] bg-[#080c10] shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden relative min-h-[820px]"
                : "w-full max-w-5xl"
            }`}
          >
            {/* Phone Speaker & Notch for Phone View */}
            {viewMode === "mobile" && (
              <div className="sticky top-0 z-40 bg-[#080c10] pt-2 pb-1 px-6 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
                <span>9:41</span>
                <div className="h-4 w-28 bg-[#1a232f] rounded-full mx-auto" />
                <span>5G 100%</span>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                OPTION 1: STREAMLINED ONE-THUMB CHECKOUT + STICKY BOTTOM BAR
               ════════════════════════════════════════════════════════════════ */}
            {selectedOption === "option1" && (
              <div className="p-4 sm:p-6 space-y-4 text-left">
                {/* 1. Sleek Top VIP Event Anchor */}
                <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#101c24] to-amber-950/30 p-3.5 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-sm shrink-0">
                      🎗️
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                        VIP Early Access Pass
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-white truncate">
                        Cancer Awareness Day 2026
                      </h3>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 line-through block font-mono">₹799</span>
                    <span className="text-sm font-mono font-black text-emerald-400">₹399</span>
                  </div>
                </div>

                {/* 2. Compact Athlete Details (Auto-prefilled from Teaser) */}
                <div className="rounded-3xl border border-white/10 bg-[#0d141d] p-4 sm:p-6 space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-[#ff4b26]" /> 1. Athlete Information
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      ✓ Instant E-Bib
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Full Name <span className="text-[#ff4b26]">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff4b26]"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Mobile / WhatsApp Number <span className="text-[#ff4b26]">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="h-10 px-3 rounded-xl bg-[#131b26] border border-white/10 text-xs font-mono text-slate-300 flex items-center shrink-0">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="10-digit mobile number"
                            className="flex-1 min-w-0 h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff4b26] font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Email Address <span className="text-[#ff4b26]">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="runner@example.com"
                          className="w-full h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff4b26]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. 1-Tap Pill Chips: Discipline & Distance (No Clunky Dropdowns) */}
                <div className="rounded-3xl border border-white/10 bg-[#0d141d] p-4 sm:p-6 space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" /> 2. Category &amp; Discipline
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap shadow-xs">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>Strava · Garmin · Any GPS App</span>
                  </span>
                  </div>

                  {/* Discipline Chips */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Choose Mode (All Earn the Same Solid Metal Medal)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "running", label: "🏃 Running" },
                        { id: "walking", label: "🚶 Walking" },
                        { id: "cycling", label: "🚴 Cycling" },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedActivity(id as any)}
                          className={`h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer border ${
                            selectedActivity === id
                              ? "bg-[#ff4b26]/20 border-[#ff4b26] text-white shadow-md"
                              : "bg-[#131b26] border-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Distance Chips */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Official Distance Category
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {["1.5 km", "3 km", "5 km", "10 km", "21 km"].map((dist) => (
                        <button
                          key={dist}
                          type="button"
                          onClick={() => setSelectedDistance(dist)}
                          className={`h-9 rounded-xl text-[11px] font-black transition-all flex items-center justify-center cursor-pointer border ${
                            selectedDistance === dist
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md font-mono"
                              : "bg-[#131b26] border-white/10 text-slate-400 hover:text-white font-mono"
                          }`}
                        >
                          {dist}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Streamlined Delivery Address & T-Shirt */}
                <div className="rounded-3xl border border-white/10 bg-[#0d141d] p-4 sm:p-6 space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-cyan-400" /> 3. Medal Courier Address
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      100% Free Shipping
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Pincode with Auto-Detected City & State */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">
                          Pincode (6-Digit) <span className="text-[#ff4b26]">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="e.g. 110001"
                          className="w-full h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">
                          City &amp; State (Auto-Populated)
                        </label>
                        <div className="h-10 px-3 rounded-xl bg-[#131b26] border border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
                          <span>{city}, {stateVal}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">✓ Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">
                        Complete Street Address <span className="text-[#ff4b26]">*</span>
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House/Flat No., Apartment, Street, Landmark"
                        className="w-full h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Compact T-Shirt Pill Selector */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Shirt className="h-3 w-3 text-amber-400" /> Top 3 Podium Dri-Fit T-Shirt Size
                        </span>
                        <span className="text-[9px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Podium Award
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { size: "S", chest: "38\"" },
                          { size: "M", chest: "40\"" },
                          { size: "L", chest: "42\"" },
                          { size: "XL", chest: "44\"" },
                          { size: "XXL", chest: "46\"" },
                        ].map((t) => (
                          <button
                            key={t.size}
                            type="button"
                            onClick={() => setSelectedTshirt(t.size)}
                            className={`h-9 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer border ${
                              selectedTshirt === t.size
                                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                                : "bg-[#131b26] border-white/10 text-slate-400 hover:text-white"
                            }`}
                          >
                            <span>{t.size}</span>
                            <span className="text-[8px] font-mono text-slate-400">{t.chest}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Auto-Applied VIP Coupon Pill */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                    <div>
                      <span className="font-mono font-bold text-white uppercase tracking-wider">
                        {couponCode} Applied
                      </span>
                      <span className="text-[11px] text-emerald-400 block">
                        ₹100 VIP Early-Bird Discount Auto-Deducted
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-black text-emerald-300 text-sm">-₹100</span>
                </div>

                {/* 6. Single-Line Mobile Trust Strip */}
                <div className="py-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-3 border-t border-white/10">
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-400" /> 256-Bit SSL
                  </span>
                  <span>·</span>
                  <span>UPI / GPay / Cards</span>
                  <span>·</span>
                  <span>Free Courier Tracking</span>
                </div>

                {/* 7. FIXED STICKY MOBILE CHECKOUT BAR */}
                <div className="sticky bottom-0 -mx-4 -mb-4 bg-[#0d141d]/98 border-t border-white/15 p-3.5 backdrop-blur-xl shadow-[0_-15px_30px_rgba(0,0,0,0.8)] z-30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="cursor-pointer" onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <span>Total Payable</span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${mobileSummaryOpen ? "rotate-180" : ""}`} />
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-white font-mono">₹{finalPrice}</span>
                        <span className="text-[10px] text-slate-400 line-through font-mono">₹799</span>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          50% OFF
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="flex-1 max-w-[210px] h-12 rounded-full bg-gradient-to-r from-amber-500 via-[#ff4b26] to-[#d63b25] text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Pay ₹{finalPrice} Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Expandable Order Summary Tray */}
                  {mobileSummaryOpen && (
                    <div className="pt-3 mt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-300 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between">
                        <span>Challenge Entry (5 km)</span>
                        <span className="font-mono">₹{basePrice}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400">
                        <span>VIP100 Discount</span>
                        <span className="font-mono">-₹{discount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pan-India Doorstep Delivery</span>
                        <span className="text-emerald-400 font-bold uppercase text-[10px]">FREE</span>
                      </div>
                      <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-white">
                        <span>Final Amount (Taxes Included)</span>
                        <span className="font-mono text-emerald-400 text-sm">₹{finalPrice}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                OPTION 2: 2-STEP FAST PASS WIZARD
               ════════════════════════════════════════════════════════════════ */}
            {selectedOption === "option2" && (
              <div className="p-4 sm:p-6 space-y-4 text-left">
                {/* Step Progress Header */}
                <div className="rounded-2xl bg-[#0d141d] border border-white/10 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      {step === 1 ? "Step 1 of 2: Athlete & Category" : "Step 2 of 2: Shipping & Payment"}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300">
                      {step === 1 ? "Next: Courier Address →" : "← Back to Step 1"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-amber-500 to-[#ff4b26] transition-all duration-300 ${
                        step === 1 ? "w-1/2" : "w-full"
                      }`}
                    />
                  </div>
                </div>

                {step === 1 ? (
                  /* Step 1: Athlete & Category */
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-[#0d141d] p-4 sm:p-6 space-y-3 shadow-xl">
                      <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                        <Award className="h-3.5 w-3.5 text-[#ff4b26]" /> Athlete Identification
                      </h3>
                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">Phone Number (WhatsApp Updates)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">Email (Digital Bib Delivery)</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-[#0d141d] p-4 sm:p-6 space-y-3 shadow-xl">
                      <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                        <Zap className="h-3.5 w-3.5 text-amber-400" /> Challenge Category
                      </h3>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1.5">Activity Mode</span>
                        <div className="grid grid-cols-3 gap-2">
                          {["🏃 Running", "🚶 Walking", "🚴 Cycling"].map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setSelectedActivity(mode.includes("Run") ? "running" : mode.includes("Walk") ? "walking" : "cycling")}
                              className="h-10 rounded-xl text-xs font-bold bg-[#131b26] border border-white/10 text-white hover:border-[#ff4b26]"
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1.5">Distance</span>
                        <div className="grid grid-cols-5 gap-1.5">
                          {["1.5 km", "3 km", "5 km", "10 km", "21 km"].map((dist) => (
                            <button
                              key={dist}
                              type="button"
                              onClick={() => setSelectedDistance(dist)}
                              className={`h-9 rounded-xl text-xs font-mono font-bold border ${
                                selectedDistance === dist ? "border-amber-500 bg-amber-500/20 text-amber-300" : "border-white/10 bg-[#131b26] text-slate-400"
                              }`}
                            >
                              {dist}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full h-12 rounded-full bg-gradient-to-r from-amber-500 to-[#ff4b26] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <span>Continue to Medal Delivery (Step 2)</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  /* Step 2: Delivery & Pay */
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-3">
                    <div className="rounded-3xl border border-white/10 bg-[#0d141d] p-4 sm:p-6 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 text-cyan-400" /> Medal Delivery Coordinates
                        </h3>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-[10px] text-amber-300 underline"
                        >
                          Edit Step 1
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Pincode</label>
                          <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            className="w-full h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">City / State</label>
                          <div className="h-10 px-3 rounded-xl bg-[#131b26] border border-white/10 flex items-center text-xs text-slate-300 truncate">
                            {city}, {stateVal}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">Street Address</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl bg-[#131b26] border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Final Pay Card */}
                    <div className="rounded-3xl border border-amber-500/40 bg-[#0d141d] p-4 sm:p-5 space-y-3 shadow-xl">
                      <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                        <span className="font-bold text-white">Total Payable (Taxes &amp; Courier Inc.)</span>
                        <span className="text-xl font-black text-emerald-400 font-mono">₹{finalPrice}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        ⚡ Code <strong>VIP100</strong> auto-applied (₹100 OFF on ₹499 fee).
                      </p>
                      <button
                        type="button"
                        className="w-full h-12 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Pay ₹{finalPrice} via Razorpay UPI / Cards</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                OPTION 3: MODERN APP-STYLE ACCORDION
               ════════════════════════════════════════════════════════════════ */}
            {selectedOption === "option3" && (
              <div className="p-4 sm:p-6 space-y-3 text-left">
                {/* Panel 1: Athlete Info */}
                <div className="rounded-2xl border border-white/10 bg-[#0d141d] overflow-hidden">
                  <div
                    onClick={() => setOpenSection(openSection === "athlete" ? "summary" : "athlete")}
                    className="p-3.5 flex items-center justify-between cursor-pointer bg-[#131b26]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                        1
                      </span>
                      <span className="text-xs font-bold text-white">Athlete &amp; Category</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {name ? `${name} (${selectedDistance})` : "Fill details"} ▾
                    </span>
                  </div>
                  {openSection === "athlete" && (
                    <div className="p-4 space-y-2.5 border-t border-white/10 animate-in fade-in">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full h-9 px-3 rounded-xl bg-[#080c10] border border-white/10 text-xs text-white"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full h-9 px-3 rounded-xl bg-[#080c10] border border-white/10 text-xs text-white font-mono"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full h-9 px-3 rounded-xl bg-[#080c10] border border-white/10 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setOpenSection("delivery")}
                        className="w-full h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                      >
                        Next: Delivery Address →
                      </button>
                    </div>
                  )}
                </div>

                {/* Panel 2: Delivery Coordinates */}
                <div className="rounded-2xl border border-white/10 bg-[#0d141d] overflow-hidden">
                  <div
                    onClick={() => setOpenSection(openSection === "delivery" ? "summary" : "delivery")}
                    className="p-3.5 flex items-center justify-between cursor-pointer bg-[#131b26]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black">
                        2
                      </span>
                      <span className="text-xs font-bold text-white">Medal Courier Shipping</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {pincode ? `${pincode} (${city})` : "Address"} ▾
                    </span>
                  </div>
                  {openSection === "delivery" && (
                    <div className="p-4 space-y-2.5 border-t border-white/10 animate-in fade-in">
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="6-Digit Pincode"
                        className="w-full h-9 px-3 rounded-xl bg-[#080c10] border border-white/10 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Complete Street Address"
                        className="w-full h-9 px-3 rounded-xl bg-[#080c10] border border-white/10 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setOpenSection("summary")}
                        className="w-full h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                      >
                        Next: Payment →
                      </button>
                    </div>
                  )}
                </div>

                {/* Panel 3: Payment */}
                <div className="rounded-2xl border border-white/10 bg-[#0d141d] p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Total Amount</span>
                    <span className="font-mono text-lg font-black text-emerald-400">₹{finalPrice}</span>
                  </div>
                  <button
                    type="button"
                    className="w-full h-12 rounded-full bg-gradient-to-r from-amber-500 via-[#ff4b26] to-[#d63b25] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Pay ₹{finalPrice} &amp; Complete Registration</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

