import type { NextConfig } from "next";

const LIVE_CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsucnVubmVydXAuaW4k";

const rawPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  "";

const publishableKey =
  rawPublishableKey && !rawPublishableKey.startsWith("pk_test_")
    ? rawPublishableKey
    : LIVE_CLERK_PUBLISHABLE_KEY;

process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  devIndicators: false,
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
  },

  // ── Backend API & Webhook proxy ─────────────────────────
  // Forwards /api/* and /health to the backend server (locally or configured URL)
  // so external clients accessing runnerup.in can reach the API without CORS or mixed-content issues.
  async rewrites() {
    const isDev = process.env.NODE_ENV !== "production";
    const rawTarget = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
    const backendTarget =
      rawTarget
        ? rawTarget
        : isDev
          ? "http://127.0.0.1:4000"
          : "https://api.runnerup.in";

    return [
      {
        source: "/api/:path*",
        destination: `${backendTarget}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${backendTarget}/health`,
      },
      {
        source: "/images/club-push.png",
        destination: "/images/club-push.svg",
      },
      {
        source: "/images/first-medal.png",
        destination: "/images/first-medal.svg",
      },
      {
        source: "/images/mountain-run-hero.png",
        destination: "/images/mountain-run-hero.svg",
      },
      {
        source: "/images/sunrise-finish.png",
        destination: "/images/sunrise-finish.svg",
      },
      {
        source: "/images/weekend-long-run.png",
        destination: "/images/weekend-long-run.svg",
      },
    ];
  },

  // ── Image optimisation ───────────────────────────────────
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
    ],
  },

  // ── Edge Cache for Public Static Assets & Pages ──────────
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2|webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(about|what-is-virtual-run|refer|gallery|leaderboard|register)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/events/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
