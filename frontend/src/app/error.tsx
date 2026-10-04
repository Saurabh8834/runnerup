"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { PageShell } from "./components/app-shell";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for monitoring
    console.error("[App Error Boundary Caught]:", error);
  }, [error]);

  return (
    <PageShell>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e64833]/15 border border-[#e64833]/30 text-[#e64833] shadow-lg shadow-[#e64833]/20">
            <AlertTriangle className="h-10 w-10 text-[#e64833]" />
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#fbe9d0]">
            Temporary Pace Stumble
          </h1>

          <p className="text-sm text-[#90aead] leading-relaxed">
            Something interrupted your race view. Don&apos;t worry, your progress and session are safe. Tap below to reload the section.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e64833] to-[#c93b27] px-6 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Load</span>
            </button>

            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#90aead]/30 bg-[#244855]/60 px-6 text-xs font-bold uppercase tracking-wider text-[#fbe9d0] transition-all hover:bg-[#244855]"
            >
              <Home className="h-4 w-4" />
              <span>Back Home</span>
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
