"use client";

import { ChevronDown, HelpCircle, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type FaqItem = {
  question: string;
  answer: string;
};

const homeFaqs: FaqItem[] = [
  {
    question: "What is virtual running and how does RUNNERUP work in India?",
    answer:
      "A virtual run allows you to participate from any city across India — outdoors on roads, trails, or indoors on a treadmill — at your own convenient pace and schedule. Register for any RUNNERUP challenge, complete your chosen distance (1.5 km, 5 km, 10 km, or 21 km Half Marathon) using any GPS tracking app (Strava, Garmin, Nike Run Club, Apple Fitness), and upload your activity screenshot on your dashboard. Once verified, your official QR-verified E-Certificate is unlocked instantly and your physical heavy metal finisher medal is dispatched to your doorstep with free delivery.",
  },
  {
    question: "Which GPS running apps and smartwatches are accepted for verification?",
    answer:
      "We accept all major GPS running apps and fitness trackers including Strava, Garmin Connect, Nike Run Club (NRC), Adidas Running, Apple Watch / Apple Fitness, Samsung Health, Google Fit, Coros, and Suunto. Treadmill runs are also accepted by uploading a clear photo of the treadmill console showing elapsed time and distance.",
  },
  {
    question: "Do I get a real metal finisher medal, t-shirt, and certificate with my registration?",
    answer:
      "Yes! Every finisher who completes their distance and uploads valid activity proof receives an authentic, heavy die-cast 3D embossed metal finisher medal, premium DRI-FIT event t-shirt (if selected), and official verifiable E-Certificate with QR code. Physical kits are dispatched via express tracked courier with zero delivery charges across all 19,000+ Indian pincodes.",
  },
  {
    question: "Can beginners, joggers, women, and families participate in RUNNERUP events?",
    answer:
      "Absolutely! RUNNERUP challenges are beginner-friendly and designed for all fitness levels. We offer starter distances from 1.5K and 5K fun runs up to 21K half marathons. You can complete your distance by running, jogging, or brisk walking at your own comfortable pace.",
  },
  {
    question: "How long does verification take and when is the medal delivered?",
    answer:
      "Our arbiters review and approve GPS proofs within 4 to 12 hours. Your digital QR-verifiable certificate is available immediately upon approval. Physical finisher medals and kits are dispatched via express courier (Delhivery/Shiprocket) and reach most runners within 5-8 business days with live tracking.",
  },
  {
    question: "Do you deliver finisher medals across India?",
    answer:
      "Yes! RUNNERUP delivers to all 19,000+ pincodes across India — including Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, Chandigarh, Lucknow, Kochi, and all tier-2 and tier-3 towns, with 100% free delivery.",
  },
];

export function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-20 lg:py-24 bg-[#14242a] text-[#fbe9d0] border-t border-[#90aead]/15 overflow-hidden scroll-mt-28">
      {/* Background Accent Glow */}
      <div className="pointer-events-none absolute top-1/2 left-0 -z-10 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#244855]/30 blur-[140px]" />

      <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Side-by-side Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT COLUMN - Sticky Header & Quick Support CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e64833]/40 bg-[#e64833]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#e64833] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 fill-[#e64833]" />
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="mt-4 font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#fbe9d0] leading-tight">
              EVERYTHING YOU NEED TO KNOW ABOUT <span className="text-[#e64833] italic">VIRTUAL RACES</span>
            </h2>
            <p className="mt-3 sm:mt-4 text-xs sm:text-base text-[#90aead] font-medium leading-relaxed">
              Got questions about GPS verification, real metal medals, or certificate delivery? We&apos;ve got clear answers for every runner.
            </p>

            {/* Quick Contact Dark Glass Card */}
            <div className="mt-8 rounded-3xl border border-[#90aead]/20 bg-[#172c34]/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#90aead]/30 bg-[#244855] text-[#e64833]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-[#fbe9d0]">Have more questions?</span>
                  <span className="block text-xs text-[#90aead] font-medium">Our athlete support is live 24/7</span>
                </div>
              </div>
              <Link
                href="/about"
                className="w-full sm:w-auto text-center shrink-0 rounded-full border border-[#90aead]/30 bg-[#244855]/60 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#fbe9d0] hover:bg-[#e64833] hover:text-[#fbe9d0] hover:border-[#e64833] transition-all shadow-md"
              >
                Help & FAQs
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN - Compact Accordions */}
          <div className="lg:col-span-7 space-y-3.5">
            {homeFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-[#e64833]/60 bg-[#1b323b] shadow-[0_4px_25px_rgba(230,72,51,0.15)]"
                      : "border-[#90aead]/15 bg-[#172c34]/80 hover:border-[#90aead]/30 hover:bg-[#172c34]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left font-display font-bold text-sm sm:text-base text-[#fbe9d0] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className={`h-4 w-4 shrink-0 transition-colors ${isOpen ? "text-[#e64833]" : "text-[#90aead]"}`} />
                      <span>{faq.question}</span>
                    </span>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isOpen ? "border-[#e64833] bg-[#e64833] text-white" : "border-[#90aead]/20 bg-[#244855]/40 text-[#90aead]"
                    }`}>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-6 pb-6 pt-1 border-t border-[#90aead]/15">
                          <p className="text-xs sm:text-sm leading-relaxed text-[#fbe9d0]/80 font-medium">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
