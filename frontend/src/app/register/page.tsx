import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { PageShell } from "../components/app-shell";
import { PaymentRegistrationForm } from "./payment-registration-form";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

export const metadata: Metadata = {
  title: "Register for Virtual Running Events & Marathons India 2026 | RunnerUp",
  description:
    "Register online for RunnerUp virtual marathon challenges across India. Choose distances from 1.5K, 3K, 5K, 10K, to 21K Half Marathon. GPS activity verification, solid metal finisher medals, DRI-FIT t-shirts, and instant digital certificates.",
  keywords: [
    "register virtual marathon",
    "virtual run registration india",
    "online marathon entry 2026",
    "5k run registration",
    "10k marathon entry india",
    "half marathon registration online",
    "virtual race ticket india",
    "runnerup registration",
  ],
  openGraph: {
    title: "Register for Virtual Running Events & Marathons India 2026 | RunnerUp",
    description:
      "Join India's premier virtual running events. Pick your distance, pay securely via UPI, and earn authentic heavy metal finisher medals.",
    url: `${SITE_URL}/register`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Register for RunnerUp Virtual Running Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register for Virtual Running Events | RunnerUp",
    description: "Join upcoming virtual runs and earn heavy metal finisher medals.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/register`,
  },
};

export default function RegisterPage() {
  return (
    <PageShell checkoutFooter>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <section className="pt-20 sm:pt-24 pb-2 sm:pb-4">
        <div className="container-page max-w-6xl">
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-emerald-500/20 border-t-emerald-500" />
              </div>
            }
          >
            <PaymentRegistrationForm />
          </Suspense>
        </div>
      </section>
    </PageShell>
  );
}
