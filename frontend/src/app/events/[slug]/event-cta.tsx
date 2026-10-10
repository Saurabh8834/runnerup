import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import type { PublicEvent } from "../../data/events";
import { RegisterCta } from "../../components/register-cta";
import { Medal3D } from "./medal";
import { EventCountdown } from "./countdown";
import { Reveal } from "./reveal";

const WHATSAPP_URL = "https://wa.me/918287831071";

function formatPrice(price: string) {
  return price.replace(/^Rs\.\s*/, "₹");
}

export function EventCta({ event }: { event: PublicEvent }) {
  const whatsappUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hi! I'm interested in ${event.name}. Can you help me with registration?`,
  )}`;
  const priceLabel = event.price.toLowerCase().includes("free")
    ? "Register now"
    : `Register now - ${formatPrice(event.price)}`;

  return (
    <section className="event-classic-cta relative overflow-hidden">
      <div className="container-page py-14 sm:py-20">
        <Reveal>
          <div className="event-classic-cta-card relative overflow-hidden border border-(--gold-line) bg-gradient-to-b from-[#e64833]/10 via-(--panel) to-(--panel) px-6 py-12 text-center shadow-premium sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="sun-pulse pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(230,72,51,0.4) 0%, rgba(135,79,65,0.16) 45%, transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-(--sage) opacity-[0.07] blur-3xl"
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <div className="medal-float w-28 drop-shadow-[0_25px_30px_rgba(230,72,51,0.25)] sm:w-36">
                <Medal3D className="h-auto w-full" />
              </div>

              <h2 className="heading mt-6 text-(--foreground)">This one&rsquo;s yours to win.</h2>
              <p className="lede mt-3 max-w-lg">
                {event.name} - pick a distance and register in under two minutes with UPI.
              </p>

              {event.endsAt ? (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-widest text-(--muted)">
                    <Sparkles className="h-3.5 w-3.5 text-(--gold-deep)" />
                    Registration closes in
                  </span>
                  <EventCountdown targetDate={event.endsAt} />
                </div>
              ) : null}

              <div className="mt-7 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center">
                <RegisterCta
                  className="sm:min-w-56"
                  signedInLabel="Register now"
                  signedOutLabel={priceLabel}
                  slug={event.slug}
                />
                <Link
                  className="btn btn-secondary gap-2 text-sm"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ask a question
                </Link>
              </div>

              <p className="mt-6 flex items-center gap-1.5 text-xs text-(--muted-soft)">
                <ShieldCheck className="h-3.5 w-3.5 text-(--sage)" />
                Secure Razorpay payment - Instant confirmation
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
