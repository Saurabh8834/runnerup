"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const WHATSAPP_NUMBER = "918287831071";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi RunnerUp, I have a query about virtual marathon events."
)}`;

/** Official crisp WhatsApp icon */
function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** White chat bubble icon with two text lines matching BeyondRun trigger style */
function ChatBubbleIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </svg>
  );
}

export function FloatingContact() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when navigating or clicking outside
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Hide inside admin or user dashboard
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  const isEventDetail = pathname?.startsWith("/events/") && pathname !== "/events";

  return (
    <aside
      ref={containerRef}
      data-floating-contact="true"
      aria-label="Customer Support Chat"
      className={`fixed z-50 right-3.5 sm:right-6 transition-all duration-200 ${
        isEventDetail
          ? "bottom-[5.5rem] md:bottom-[5.85rem]"
          : "bottom-[4.85rem] md:bottom-[5.25rem]"
      }`}
    >
      {/* ─── Expandable Support / WhatsApp Popup (BeyondRun Reference) ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full mb-3 right-0 w-[290px] sm:w-[320px] origin-bottom-right"
          >
            {/* Context Card */}
            <div className="overflow-hidden rounded-2xl bg-[#172c34] border border-[#90aead]/30 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl">
              {/* Card Header */}
              <div className="bg-[#14242a] px-4 py-3 border-b border-[#90aead]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#e64833] to-[#c93b27] flex items-center justify-center text-white font-black text-xs shadow-md">
                      RU
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#14242a]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#fbe9d0]">
                      RunnerUp Support
                    </h4>
                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online · Fast reply
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[#90aead] hover:text-[#fbe9d0] hover:bg-[#244855] transition-colors"
                  aria-label="Close chat menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Card Message Body */}
              <div className="p-4 space-y-3">
                <div className="rounded-xl bg-[#244855]/60 border border-[#90aead]/20 p-3 text-xs leading-relaxed text-[#fbe9d0]">
                  Hi there! 👋 Need assistance with event registration, GPS tracking, or finisher medal delivery?
                </div>

                {/* ─── Exact BeyondRun WhatsApp Pill + Circle Row ─── */}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp (+91 82878 31071)"
                  className="group flex items-center justify-end gap-2.5 pt-1 focus:outline-none"
                >
                  {/* White Pill Button */}
                  <span className="px-4 py-2.5 rounded-full bg-white text-zinc-900 font-bold text-xs sm:text-sm shadow-xl border border-zinc-200/80 transition-all duration-200 group-hover:bg-zinc-50 group-hover:scale-105 active:scale-95 select-none">
                    Chat on WhatsApp
                  </span>

                  {/* Green Circle WhatsApp Button */}
                  <span className="h-11 w-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/40 transition-transform duration-200 group-hover:scale-110 active:scale-95 shrink-0">
                    <WhatsAppIcon className="h-6 w-6" />
                  </span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Trigger Launcher Button (BeyondRun Orange Circular Icon) ─── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close support menu" : "Open support chat on WhatsApp"}
        aria-expanded={isOpen}
        className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#e64833] via-[#ea5a47] to-[#ff5722] text-white shadow-[0_10px_32px_rgba(230,72,51,0.5)] border border-[#fbe9d0]/25 transition-all duration-300 hover:scale-108 hover:shadow-[0_14px_40px_rgba(230,72,51,0.7)] active:scale-95 focus:outline-none"
      >
        {/* Pulsing Green Online Status Badge (Top Right Corner) */}
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#10b981] border-2 border-white shadow-sm" />
        </span>

        {/* Morphing Icon: Chat Bubble <-> Close X */}
        <div className="transition-transform duration-200 group-hover:scale-110">
          {isOpen ? (
            <X className="h-6 w-6 text-white stroke-[2.5]" />
          ) : (
            <ChatBubbleIcon className="h-6 w-6 text-white" />
          )}
        </div>
      </button>
    </aside>
  );
}
