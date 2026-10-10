"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RegisterCta({
  slug,
  distance,
  className,
  signedInLabel,
  signedOutLabel,
}: {
  slug: string;
  distance?: string;
  className?: string;
  signedInLabel: string;
  signedOutLabel: string;
}) {
  const { isSignedIn } = useUser();
  const query = new URLSearchParams({ event: slug });
  if (distance) query.set("distance", distance);
  const href = `/register?${query.toString()}`;

  return (
    <Link className={`btn btn-gold gap-2 text-sm group ${className ?? ""}`} href={href}>
      {isSignedIn ? signedInLabel : signedOutLabel}
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}

export function SignedOutHint() {
  const { isSignedIn } = useUser();
  if (isSignedIn) return null;

  return (
    <div className="mt-4 rounded-xl bg-(--panel-soft) px-4 py-3 text-center text-xs text-(--muted)">
      Already have an account?{" "}
      <Link href="/sign-in" className="font-semibold text-(--sage) hover:underline">
        Sign in
      </Link>
    </div>
  );
}
