import Link from "next/link";
import { ArrowLeft, Home, Calendar } from "lucide-react";
import { PageShell } from "./components/app-shell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e64833]/15 border border-[#e64833]/30 text-[#e64833] shadow-lg shadow-[#e64833]/20">
            <span className="font-display font-black text-3xl">404</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#fbe9d0]">
            Lost On The Trail?
          </h1>

          <p className="text-sm text-[#90aead] leading-relaxed">
            The page or race route you are looking for doesn&apos;t exist or has moved to a new distance. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e64833] to-[#c93b27] px-6 text-xs font-black uppercase tracking-wider text-[#fbe9d0] shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>Back Home</span>
            </Link>

            <Link
              href="/events"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#90aead]/30 bg-[#244855]/60 px-6 text-xs font-bold uppercase tracking-wider text-[#fbe9d0] transition-all hover:bg-[#244855]"
            >
              <Calendar className="h-4 w-4" />
              <span>Explore Races</span>
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
