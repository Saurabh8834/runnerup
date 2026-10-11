import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { PaymentRegistrationForm } from "./payment-registration-form";

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
    <PageShell>
      <section className="relative overflow-hidden border-b border-(--line)">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--sage) 12%, transparent) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--sage) 6%, transparent) 0%, transparent 50%)",
              "var(--background)",
            ].join(", "),
          }}
        />
        <div aria-hidden className="pointer-events-none absolute top-8 right-8 flex gap-1.5 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-(--sage) animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>

        <div className="container-page pt-24 pb-8 sm:pt-28 sm:pb-10 md:pt-32 md:pb-12">
          <div className="mx-auto max-w-xl text-center">
            <p className="eyebrow">Registration</p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-(--foreground) sm:text-5xl">
              Join an event
            </h1>
            <p className="lede mx-auto mt-4 max-w-lg">
              Pick an event and distance, add shipping, and pay with UPI. Your races will appear on your dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-6 sm:pb-8 md:pb-10">
        <div className="container-page max-w-5xl">
          <PaymentRegistrationForm />
        </div>
      </section>
    </PageShell>
  );
}
