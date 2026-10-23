import React from "react";

export function UpiLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="UPI"
    >
      {/* UPI Dual Arrow Chevron */}
      <path d="M12 4L22 16L12 28L8 28L18 16L8 4L12 4Z" fill="#097939" />
      <path d="M19 4L29 16L19 28L15 28L25 16L15 4L19 4Z" fill="#ED7524" />
      {/* UPI Text */}
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
      {/* Golden accent bar on V */}
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
      {/* Left Red Circle */}
      <circle cx="17" cy="15" r="13" fill="#EB001B" />
      {/* Right Yellow Circle */}
      <circle cx="31" cy="15" r="13" fill="#F79E1B" fillOpacity="0.9" />
      {/* Center Overlap */}
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
      {/* RuPay speed triangles */}
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

      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-(--muted) hover:text-white/80 transition-colors">
        <svg
          className="h-3.5 w-3.5 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Powered by Razorpay</span>
      </div>
    </div>
  );
}
