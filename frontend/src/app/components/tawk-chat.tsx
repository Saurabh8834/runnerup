"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: {
      toggle?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

export function openLiveChat() {
  if (typeof window !== "undefined") {
    if (window.Tawk_API?.maximize) {
      window.Tawk_API.maximize();
      return true;
    }
    if (window.Tawk_API?.toggle) {
      window.Tawk_API.toggle();
      return true;
    }
  }
  return false;
}

export function TawkChat() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (typeof window !== "undefined" && window.Tawk_API) {
      if (isAdmin) {
        window.Tawk_API.hideWidget?.();
      } else {
        window.Tawk_API.showWidget?.();
      }
    }
  }, [isAdmin]);

  if (isAdmin) {
    return null;
  }

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6ae448591c3d9f347383e1be/1k65rl8bg';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}

