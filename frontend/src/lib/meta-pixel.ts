export const META_PIXEL_ID = "3747848845367795";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Track a standard Facebook / Meta Pixel event.
 * Safe to call on client side — gracefully no-ops if Pixel hasn't loaded or during SSR.
 */
export function trackFbEvent(
  event:
    | "PageView"
    | "ViewContent"
    | "Search"
    | "AddToCart"
    | "AddToWishlist"
    | "InitiateCheckout"
    | "AddPaymentInfo"
    | "Purchase"
    | "Lead"
    | "CompleteRegistration"
    | "Contact",
  params?: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (params) {
      window.fbq("track", event, params);
    } else {
      window.fbq("track", event);
    }
  }
}

/**
 * Track a custom Facebook / Meta Pixel event.
 */
export function trackFbCustomEvent(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (params) {
      window.fbq("trackCustom", event, params);
    } else {
      window.fbq("trackCustom", event);
    }
  }
}
