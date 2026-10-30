"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    q: "Is this a physical event I need to travel for?",
    a: "No. This is a virtual event — you run, walk or cycle anywhere you like (park, road, treadmill, your city) during the event window. No travel needed.",
  },
  {
    q: "How do I complete my distance?",
    a: "Pick a distance when registering, then finish it at your own pace anytime during the event dates. Track with any GPS app such as Strava, Garmin, Nike Run Club or your phone's fitness app.",
  },
  {
    q: "How do I upload proof of my run?",
    a: "After finishing, log in to your dashboard, open your registration and upload a screenshot or export of your GPS activity. Our team verifies each result manually.",
  },
  {
    q: "When will I receive my medal and rewards?",
    a: "Once your proof is verified, your finisher medal, certificate and any included merchandise are shipped to the address you entered during registration.",
  },
  {
    q: "Is my payment safe?",
    a: "Yes. Payments are processed securely through Razorpay with UPI, cards, wallets and netbanking. Your money is protected and refunds are handled for any failed or duplicate transactions.",
  },
  {
    q: "Can I get a refund if I change my mind?",
    a: "Entry fees are non-refundable once registration is confirmed, but you can message us on WhatsApp and we'll try our best to help. Contact support and we'll assist with any issue.",
  },
  {
    q: "What if I need help during the event?",
    a: "Our team is available on WhatsApp and email throughout the event window. We're happy to help with registration, proof uploads or anything else.",
  },
];

export function EventFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-2.5">
      {faqs.map((item, index) => {
        const isOpen = open === index;
        return (
          <div
            key={item.q}
            className={`overflow-hidden rounded-2xl border transition-colors duration-200 ${
              isOpen ? "border-(--sage)/30 bg-(--panel)" : "border-(--line) bg-(--panel)"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-(--foreground) sm:text-base">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                    isOpen ? "bg-(--sage) text-white" : "bg-(--sage-soft) text-(--sage)"
                  }`}
                >
                  <MessageCircleQuestion className="h-3.5 w-3.5" />
                </span>
                {item.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-(--muted) transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-(--sage)" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="border-t border-(--line) px-4 py-3.5 text-sm leading-relaxed text-(--muted) sm:px-5 sm:py-4">
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
