"use client";

import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { ChevronRight, Medal, Route, Zap } from "lucide-react";
import { PageShell } from "../../components/app-shell";
import { useTheme } from "../../components/theme-provider";

function ThemedSignUp() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const enableGoogle = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

  useEffect(() => {
    const sanitizeClerkDom = () => {
      // 1. Ensure forms do not trigger native browser validation bubbles
      document.querySelectorAll("form").forEach((f) => {
        if (f.closest("[class*='cl-']")) f.noValidate = true;
      });

      // 2. Hide Google social button if unconfigured
      if (!enableGoogle) {
        document
          .querySelectorAll<HTMLElement>(
            ".cl-socialButtonsRoot, .cl-socialButtons, .cl-socialButtonsBlockButton, .cl-socialButtonsProviderIcon, .cl-dividerRow, [data-localization-key*='socialButtons'], [data-localization-key*='divider']"
          )
          .forEach((node) => {
            node.style.setProperty("display", "none", "important");
          });
      }

      // 3. Intercept and completely suppress development/quota alerts
      const alerts = document.querySelectorAll(
        "[class*='cl-alert'], [role='alert'], .cl-formFieldErrorText, .cl-alertText, [class*='cl-formErrorText']"
      );

      alerts.forEach((alertNode) => {
        const el = alertNode as HTMLElement;
        const text = (el.innerText || el.textContent || "").toLowerCase();
        const hasDevKeywords =
          text.includes("monthly limit") ||
          text.includes("development") ||
          text.includes("test emails") ||
          text.includes("test-emails") ||
          text.includes("go.clerk.com") ||
          text.includes("unable to complete action") ||
          text.includes("if the problem persists") ||
          el.querySelector("a[href*='clerk.com']") !== null ||
          el.querySelector("a[href*='go.clerk.com']") !== null;

        if (hasDevKeywords) {
          el.style.display = "none";
          el.classList.add("cl-dev-warning-suppressed");

          const parent = el.closest("[class*='cl-card'], form, .cl-rootBox");
          if (parent && !parent.querySelector(".runnerup-dev-fallback")) {
            const fallback = document.createElement("div");
            fallback.className =
              "runnerup-dev-fallback mt-3 mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-left";
            fallback.innerHTML = `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;background:#e64833;color:#ffffff;font-size:10px;font-weight:bold;">✉️</span>
                <span style="font-size:12px;font-weight:700;color:#fbe9d0;">Sign Up with Email</span>
              </div>
              <p style="font-size:11.5px;line-height:1.5;color:#fcf8f2;margin:0 0 10px 0;">
                Enter your <strong>email address</strong> to receive an instant verification code.
              </p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" class="runnerup-switch-to-google-btn" style="background:#e64833;color:#ffffff;border:none;border-radius:8px;padding:6px 14px;font-size:11px;font-weight:700;cursor:pointer;">
                  ← Retry Sign-Up
                </button>
              </div>
            `;

            const btn = fallback.querySelector(".runnerup-switch-to-google-btn");
            if (btn) {
              btn.addEventListener("click", () => {
                const editBtn = document.querySelector<HTMLElement>(
                  "button[aria-label*='Edit'], .cl-identityPreviewEditButton, [class*='identityPreviewEditButton'], button[data-localization-key*='back']"
                );
                if (editBtn) {
                  editBtn.click();
                } else {
                  window.location.href = "/sign-up";
                }
              });
            }

            el.parentNode?.insertBefore(fallback, el);
          }
        }
      });
    };

    sanitizeClerkDom();
    const observer = new MutationObserver(sanitizeClerkDom);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enableGoogle]);

  return (
    <div className={enableGoogle ? "w-full" : "no-google-auth w-full"}>
      <SignUp
        fallbackRedirectUrl="/dashboard"
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        appearance={{
          variables: {
            colorPrimary: "#e64833",
            colorBackground: dark ? "#172c34" : "#ffffff",
            colorNeutral: dark ? "#90aead" : "#64748b",
            borderRadius: "12px",
          },
          elements: {
            rootBox: "mx-auto w-full",
            cardBox: "w-full shadow-none",
            card: "w-full shadow-none rounded-2xl border border-(--line) bg-(--panel)",
            footer: "hidden",
            formButtonPrimary:
              "bg-[#e64833] hover:bg-[#d83d28] text-[#fbe9d0] font-bold normal-case h-11 shadow-lg",
            formFieldInput: dark
              ? "bg-[#14242a] border-white/10 text-white h-10"
              : "bg-white border-slate-200 text-slate-900 h-10",
            formFieldError: "text-red-500 text-xs mt-1",
            formFieldErrorText: dark ? "text-red-400" : "text-red-600",
            formFieldLabel: dark ? "text-[#fbe9d0] font-medium" : "text-slate-700 font-medium",
            headerTitle: dark ? "text-white font-bold" : "text-slate-900 font-bold",
            headerSubtitle: dark ? "text-[#90aead]" : "text-slate-500",
            socialButtons: enableGoogle ? undefined : "!hidden",
            socialButtonsBlockButton: enableGoogle
              ? (dark
                  ? "border-white/10 bg-[#14242a] text-white hover:bg-[#1b323b] h-11 font-semibold"
                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 h-11 font-semibold shadow-xs")
              : "!hidden",
            socialButtonsBlockButtonText: dark ? "text-white" : "text-slate-800",
            dividerRow: enableGoogle ? undefined : "!hidden",
            dividerLine: dark ? "bg-white/10" : "bg-slate-200",
            dividerText: dark ? "text-[#90aead]" : "text-slate-400",
            formFieldAction: "text-[#e64833] font-medium",
            footerActionLink: "text-[#e64833] font-semibold",
            formResendCodeLink: "text-[#e64833] font-medium",
            alert: dark
              ? "bg-red-900/20 border-red-800/30 text-red-300 rounded-xl"
              : "bg-red-50 border-red-200 text-red-700 rounded-xl",
          },
        }}
      />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <PageShell>
      <div className="auth-classic">
      <section className="auth-classic-shell section">
        <div className="container-page grid min-h-[calc(100vh-11rem)] items-center gap-10 py-6 sm:py-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div className="auth-classic-intro hidden lg:block">
            <p className="auth-classic-kicker">Join RunnerUp</p>
            <h1 className="auth-classic-title mt-5">Your finish line starts here.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#90aead]">
              Pick a race, run on your own route, and turn each verified mile into something worth keeping.
            </p>
            <div className="mt-9 space-y-4 border-t border-white/15 pt-7 text-sm text-[#fcf8f2]">
              <p className="flex items-center gap-3"><Route className="h-4 w-4 text-[#e64833]" /> Run, walk or cycle your way</p>
              <p className="flex items-center gap-3"><Medal className="h-4 w-4 text-[#fbe9d0]" /> Earn official finisher rewards</p>
            </div>
          </div>

          <div className="auth-classic-form mx-auto w-full max-w-[430px]">
            <div className="text-center lg:text-left">
              <p className="auth-classic-kicker">Get started</p>
              <h1 className="auth-classic-form-title mt-3">Create your runner account</h1>
              <p className="mt-3 text-sm leading-6 text-(--muted)">Sign up with your email to receive an instant verification code.</p>
            </div>

            {/* Instant access tip */}
            <div className="mt-4 rounded-xl border border-white/10 bg-gradient-to-r from-[#244855]/70 to-[#1b323b]/90 p-3.5 backdrop-blur-md">
              <div className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e64833] text-white text-xs font-bold mt-0.5">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                </span>
                <div>
                  <p className="text-xs font-bold text-[#fcf8f2]">
                    Quick Account Setup
                  </p>
                  <p className="text-[11.5px] text-[#90aead] mt-0.5 leading-relaxed">
                    Enter your <strong className="text-white">email address</strong> to receive an instant 6-digit verification code. If you already registered for a race, use the same email to link your bib!
                  </p>
                </div>
              </div>
            </div>

          <div className="mt-4 w-full">
            <ClerkLoading>
              <div className="w-full rounded-2xl border border-(--line) bg-(--panel) p-6">
                <div className="h-5 w-36 rounded-full bg-(--panel-soft)" />
                <div className="mt-6 h-11 rounded-lg bg-(--panel-soft)" />
                <div className="mt-3 h-11 rounded-lg bg-(--panel-soft)" />
                <div className="mt-6 h-10 rounded-full bg-(--foreground)/10" />
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <ThemedSignUp />
            </ClerkLoaded>
          </div>

          <p className="mt-6 text-center text-sm text-(--muted)">
            Already have an account?{" "}
            <Link className="inline-flex items-center gap-1 font-semibold text-[#e64833] hover:text-[#d83d28]" href="/sign-in">
              Sign in <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </p>
          </div>
        </div>
      </section>
      </div>
    </PageShell>
  );
}
