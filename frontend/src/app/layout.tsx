import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkUserSync } from "../components/clerk-user-sync";
import { ThemeProvider } from "./components/theme-provider";
import { FloatingContact } from "./components/floating-contact";
import { Analytics } from "@vercel/analytics/next";
import { StructuredData } from "./components/structured-data";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://runnerup.in";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Virtual Running Events India 2026 | Real Medals & GPS Verified Races — RUNNERUP",
    template: "%s | RUNNERUP",
  },
  description:
    "India's premier GPS-verified virtual running platform. Register with UPI, run anywhere with Strava/Garmin, earn heavy metal finisher medals, DRI-FIT t-shirts, and instant E-certificates. Compete in 1.5K, 5K, 10K, and 21K challenges.",
  keywords: [
    "virtual running",
    "virtual running events india",
    "virtual marathon india",
    "runnerup",
    "runnerup virtual marathon",
    "online running challenge india",
    "virtual 5k run",
    "virtual 10k race",
    "half marathon virtual 2026",
    "running events india",
    "strava virtual marathon",
    "garmin running events india",
    "virtual run with medal",
    "finisher medals india",
    "running certificates",
    "fitness challenge india",
    "virtual race registration",
  ],
  authors: [{ name: "RUNNERUP" }],
  creator: "RUNNERUP",
  publisher: "RUNNERUP",
  category: "Sports & Fitness",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: "RUNNERUP",
    title: "Virtual Running Events India 2026 | Real Medals & GPS Verified Races — RUNNERUP",
    description:
      "Join India's premier virtual running events. Run anywhere with Strava/Garmin, earn authentic metal finisher medals and digital certificates.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RUNNERUP - Virtual Running Events India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Running Events India 2026 | Real Medals & GPS Verified Races — RUNNERUP",
    description:
      "Join India's premier virtual running events. Run anywhere with Strava/Garmin, earn authentic metal finisher medals and digital certificates.",
    images: ["/og-image.png"],
    creator: "@runnerup",
  },

  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#244855",
};

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="dark"
      data-scroll-behavior="smooth"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external origins to reduce latency */}
        <link rel="preconnect" href="https://tidy-haddock-9482.clerk.accounts.dev" />
        <link rel="preconnect" href="https://img.clerk.com" />
        <link rel="dns-prefetch" href="https://tidy-haddock-9482.clerk.accounts.dev" />
        <link rel="dns-prefetch" href="https://img.clerk.com" />
        <StructuredData />
      </head>
      <body className="relative min-h-full flex flex-col bg-[#14242a] text-[#fcf8f2] overflow-x-hidden">
        {/* Global Runner Backdrop Image Overlay — Hardware Accelerated */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[-1] select-none overflow-hidden will-change-transform transform-gpu"
        >
          <img
            src="/runner-img.webp"
            alt=""
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover object-center opacity-20 filter blur-[2px] sm:blur-[4px] brightness-75 contrast-125 transform-gpu"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#14242a]/80 via-[#14242a]/90 to-[#14242a]" />
        </div>

        <ThemeProvider>
          <ClerkProvider
            publishableKey={publishableKey || undefined}
            appearance={{
              variables: {
                colorPrimary: "#e64833",
                borderRadius: "0.75rem",
              },
              elements: {
                formButtonPrimary:
                  "bg-[var(--foreground)] hover:bg-[var(--accent-hover)] shadow-none",
                footerActionLink: "text-[var(--foreground)] hover:text-[var(--muted)]",
                socialButtonsBlockButton: "border border-[var(--line)]",
                footer: "hidden",
              },
            }}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            afterSignOutUrl="/"
          >
            <ClerkUserSync />
            {children}
            <FloatingContact />
          </ClerkProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
