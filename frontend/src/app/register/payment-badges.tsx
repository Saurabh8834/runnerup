import React from "react";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export function UpiLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="UPI"
    >
      <path d="M12 4L22 16L12 28L8 28L18 16L8 4L12 4Z" fill="#097939" />
      <path d="M19 4L29 16L19 28L15 28L25 16L15 4L19 4Z" fill="#ED7524" />
      <text
        x="33"
        y="23"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="20"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="0.05em"
      >
        UPI
      </text>
    </svg>
  );
}

export function VisaLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VISA"
    >
      <text
        x="4"
        y="19"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="0.08em"
      >
        VISA
      </text>
      <path d="M4 4L9 4L6 11L4 4Z" fill="#F7B600" />
    </svg>
  );
}

export function MastercardLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Mastercard"
    >
      <circle cx="17" cy="15" r="13" fill="#EB001B" />
      <circle cx="31" cy="15" r="13" fill="#F79E1B" fillOpacity="0.9" />
      <path
        d="M24 6.7C27.4 9.1 29.5 13 29.5 15C29.5 17 27.4 20.9 24 23.3C20.6 20.9 18.5 17 18.5 15C18.5 13 20.6 9.1 24 6.7Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function RupayLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RuPay"
    >
      <text
        x="2"
        y="19"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="20"
        fontWeight="900"
        letterSpacing="0.02em"
      >
        RuPay
      </text>
      <path d="M72 5L80 12L72 19L75 19L83 12L75 5L72 5Z" fill="#F47920" />
      <path d="M78 5L86 12L78 19L81 19L89 12L81 5L78 5Z" fill="#00A4E4" />
    </svg>
  );
}

export function RazorpayTrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2 text-white/60">
      <div className="flex items-center gap-3">
        <UpiLogo className="h-4.5 sm:h-5 w-auto opacity-90 hover:opacity-100 transition-opacity" />
        <VisaLogo className="h-4 sm:h-4.5 w-auto opacity-90 hover:opacity-100 transition-opacity" />
        <MastercardLogo className="h-5 sm:h-5.5 w-auto opacity-90 hover:opacity-100 transition-opacity" />
        <RupayLogo className="h-4 sm:h-4.5 w-auto opacity-90 hover:opacity-100 transition-opacity" />
      </div>

      <div className="hidden sm:block h-4 w-px bg-white/20" />

      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-300 hover:text-white transition-colors">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>Powered by Razorpay</span>
      </div>
    </div>
  );
}

/**
 * Premium Trusted Payment Brands Card (Placed directly below Order Summary Price Card)
 * Dedicated strictly to verified payment options: UPI Apps, Card Networks, Razorpay, and 256-Bit SSL Encryption.
 */
export function PremiumTrustedBrandsCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d141d]/90 p-5 shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            100% Secure Payment Checkout
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <Lock className="h-2.5 w-2.5" /> 256-Bit SSL
        </span>
      </div>

      {/* Verified Payment Networks: UPI, Visa, Mastercard, RuPay */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 space-y-2.5">
        <div className="flex items-center justify-around gap-2 px-1">
          <UpiLogo className="h-5 sm:h-5.5 w-auto shrink-0" />
          <VisaLogo className="h-4 sm:h-4.5 w-auto shrink-0" />
          <MastercardLogo className="h-4.5 sm:h-5 w-auto shrink-0" />
          <RupayLogo className="h-4 sm:h-4.5 w-auto shrink-0" />
        </div>
        <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-white/5 text-[10.5px] font-mono text-emerald-400 font-semibold text-center">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>Instant UPI &amp; Cards · Zero Payment Failure</span>
        </div>
      </div>

      {/* Official Razorpay Gateway */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
          <div>
            <strong className="text-white block font-sans">Razorpay Secured Gateway</strong>
            <span className="text-[10.5px] text-blue-300/80">256-Bit SSL Encrypted &amp; Protected</span>
          </div>
        </div>
        <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
      </div>
    </div>
  );
}
