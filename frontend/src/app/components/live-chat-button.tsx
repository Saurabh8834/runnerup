"use client";

import React from "react";
import { openLiveChat } from "./tawk-chat";

export function LiveChatButton({
  children,
  className = "btn btn-secondary gap-2 text-sm",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openLiveChat()}
      className={className}
    >
      {children || "Ask a question"}
    </button>
  );
}
