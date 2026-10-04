"use client";

import type { ReactNode } from "react";

export function HomeSectionHeader({
  eyebrow,
  title,
  lead,
  action,
  align = "left",
  theme = "dark",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  align?: "left" | "split";
  theme?: "light" | "dark";
}) {
  const isLight = theme === "light";
  const titleClass = isLight
    ? "mt-2.5 sm:mt-3 font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#14242a]"
    : "mt-2.5 sm:mt-3 font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#fbe9d0]";
  const leadClass = isLight
    ? "mt-2.5 sm:mt-3 text-xs sm:text-base text-[#244855]/90 max-w-xl font-medium"
    : "mt-2.5 sm:mt-3 text-xs sm:text-base text-[#90aead] max-w-xl";

  if (align === "split") {
    return (
      <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between mb-8">
        <div className="min-w-0">
          <span className="inline-block rounded-full border border-[#e64833]/40 bg-[#e64833]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#e64833]">
            {eyebrow}
          </span>
          <h2 className={titleClass}>
            {title}
          </h2>
          {lead ? (
            <p className={leadClass}>{lead}</p>
          ) : null}
        </div>
        {action ? (
          <div className="w-full shrink-0 sm:w-auto">{action}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <span className="inline-block rounded-full border border-[#e64833]/40 bg-[#e64833]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#e64833]">
        {eyebrow}
      </span>
      <h2 className={titleClass}>
        {title}
      </h2>
      {lead ? (
        <p className={leadClass}>{lead}</p>
      ) : null}
    </div>
  );
}


