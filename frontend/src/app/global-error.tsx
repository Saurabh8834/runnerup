"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Caught]:", error);
  }, [error]);

  return (
    <html lang="en" className="dark h-full antialiased" data-theme="dark">
      <body className="min-h-full flex flex-col items-center justify-center bg-[#14242a] text-[#fcf8f2] px-4 py-16 text-center font-sans">
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e64833]/15 border border-[#e64833]/30 text-[#e64833] shadow-lg shadow-[#e64833]/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tight text-[#fbe9d0]">
            RUNNERUP
          </h1>

          <p className="text-sm text-[#90aead] leading-relaxed">
            A connection or rendering hiccup occurred. Tap below to reload the app.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#e64833] hover:bg-[#c93b27] px-6 text-xs font-black uppercase tracking-wider text-white shadow-lg cursor-pointer transition-all"
            >
              Reload Page
            </button>
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-6 text-xs font-bold uppercase tracking-wider text-white transition-all"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
