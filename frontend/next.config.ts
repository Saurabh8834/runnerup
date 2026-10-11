import type { NextConfig } from "next";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  "";

if (publishableKey && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
  },

  // ── Backend API & Webhook proxy ─────────────────────────
  // Forwards /api/* and /health to the backend server (locally or configured URL)
  // so external clients accessing runnerup.in can reach the API without CORS or mixed-content issues.
  async rewrites() {
    const isDev = process.env.NODE_ENV !== "production";
    const backendTarget = (
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (isDev ? "http://127.0.0.1:4000" : "https://api.runnerup.in")
    ).replace(/\/+$/, "");

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
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 200, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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

  // ── Edge Cache for Public Static Assets ─────────────────
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2|webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
