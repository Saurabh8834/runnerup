"use client";

import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, ChevronRight, Trophy, Zap } from "lucide-react";
import { PageShell } from "../../components/app-shell";
import { useTheme } from "../../components/theme-provider";
import { resilientFetch } from "../../../lib/api";

function ThemedSignIn() {
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
          // Suppress the development error completely from user view
          el.style.display = "none";
          el.classList.add("cl-dev-warning-suppressed");

          // Find parent card / form to insert user-friendly guidance
          const parent = el.closest("[class*='cl-card'], form, .cl-rootBox");
          if (parent && !parent.querySelector(".runnerup-dev-fallback")) {
            const fallback = document.createElement("div");
            fallback.className =
              "runnerup-dev-fallback mt-3 mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-left";
            fallback.innerHTML = `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;background:#e64833;color:#ffffff;font-size:10px;font-weight:bold;">✉️</span>
                <span style="font-size:12px;font-weight:700;color:#fbe9d0;">Sign in with Email</span>
              </div>
              <p style="font-size:11.5px;line-height:1.5;color:#fcf8f2;margin:0 0 10px 0;">
                Enter your <strong>registered email address</strong> to receive an instant verification code.
              </p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" class="runnerup-switch-to-google-btn" style="background:#e64833;color:#ffffff;border:none;border-radius:8px;padding:6px 14px;font-size:11px;font-weight:700;cursor:pointer;">
                  ← Retry Sign-In
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
                  window.location.href = "/sign-in";
                }
              });
            }

            el.parentNode?.insertBefore(fallback, el);
          }
        }

        // 4. Intercept "Couldn't find your account" to auto-link registered runners or guide them
        if (text.includes("couldn't find your account") || text.includes("could not find your account")) {
          const input = document.querySelector<HTMLInputElement>("input[name='identifier'], input[type='email']");
          const email = input?.value?.trim().toLowerCase();
          const parent = el.closest("[class*='cl-card'], form, .cl-rootBox");

          if (email && parent && !parent.querySelector(".runnerup-notfound-helper")) {
            const helper = document.createElement("div");
            helper.className =
              "runnerup-notfound-helper mt-2 mb-3 rounded-xl border border-amber-500/30 bg-amber-950/40 p-3 text-left text-xs";
            helper.innerHTML = `
              <div style="color:#fbe9d0;font-weight:600;margin-bottom:4px;">🔍 Checking runner registration...</div>
            `;
            el.parentNode?.insertBefore(helper, el.nextSibling);

            resilientFetch("/api/users/ensure-account", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            })
              .then((r: Response) => r.json())
              .then((res: any) => {
                const data = res?.data || res;
                if (data?.provisioned) {
                  helper.className =
                    "runnerup-notfound-helper mt-2 mb-3 rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-3 text-left text-xs";
                  helper.innerHTML = `
                    <div style="color:#34d399;font-weight:700;margin-bottom:3px;">✓ Runner Registration Found! (Bib: ${data.bibNumber || 'Active'})</div>
                    <p style="color:#fbe9d0;margin-bottom:6px;">Your login access is activated. Click <strong>Continue</strong> below to receive your verification code.</p>
                  `;
                  el.style.display = "none";
                } else {
                  helper.className =
                    "runnerup-notfound-helper mt-2 mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left text-xs";
                  helper.innerHTML = `
                    <p style="color:#fbe9d0;margin-bottom:8px;">No account found with this email. Registered for a race?</p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                      <a href="/prize/${encodeURIComponent(email)}" style="background:#e64833;color:#ffffff;border-radius:6px;padding:6px 12px;text-decoration:none;font-weight:600;font-size:11px;">Track Bib / Medals →</a>
                      <a href="/sign-up" style="background:#244855;color:#fbe9d0;border-radius:6px;padding:6px 12px;text-decoration:none;font-weight:600;font-size:11px;">Create Account</a>
                    </div>
                  `;
                }
              })
              .catch(() => {
                helper.innerHTML = `
                  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                    <a href="/prize/${encodeURIComponent(email)}" style="background:#e64833;color:#ffffff;border-radius:6px;padding:6px 12px;text-decoration:none;font-weight:600;font-size:11px;">Track Bib / Medals →</a>
                  </div>
                `;
              });
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
      <SignIn
        fallbackRedirectUrl="/dashboard"
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
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

export default function SignInPage() {
  const router = useRouter();
  const [bibInput, setBibInput] = useState("");

  function handleRunnerLookup(e: React.FormEvent) {
    e.preventDefault();
    const clean = bibInput.trim();
    if (!clean) return;
    router.push(`/prize/${encodeURIComponent(clean)}`);
  }

  return (
    <PageShell>
      <div className="auth-classic">
      <section className="auth-classic-shell section">
        <div className="container-page grid min-h-[calc(100vh-11rem)] items-center gap-10 py-6 sm:py-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div className="auth-classic-intro hidden lg:block">
            <p className="auth-classic-kicker">RunnerUp runners&apos; club</p>
            <h1 className="auth-classic-title mt-5">Welcome back to the road.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#90aead]">
              Your next finish line is waiting. Check your runs, upload proof, and follow your place on the board.
            </p>
            <div className="mt-9 space-y-4 border-t border-white/15 pt-7 text-sm text-[#fcf8f2]">
              <p className="flex items-center gap-3"><BadgeCheck className="h-4 w-4 text-[#e64833]" /> GPS-verified race results</p>
              <p className="flex items-center gap-3"><Trophy className="h-4 w-4 text-[#fbe9d0]" /> Medals, certificates & milestones</p>
            </div>
          </div>

          <div className="auth-classic-form mx-auto w-full max-w-[430px]">
            <div className="text-center lg:text-left">
              <p className="auth-classic-kicker">Welcome back</p>
              <h1 className="auth-classic-form-title mt-3">Sign in to your runner portal</h1>
              <p className="mt-3 text-sm leading-6 text-(--muted)">Sign in with your email to receive an instant verification code.</p>
            </div>

            {/* Instant access tip */}
            <div className="mt-4 rounded-xl border border-white/10 bg-gradient-to-r from-[#244855]/70 to-[#1b323b]/90 p-3.5 backdrop-blur-md">
              <div className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e64833] text-white text-xs font-bold mt-0.5">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                </span>
                <div>
                  <p className="text-xs font-bold text-[#fcf8f2]">
                    Registered Runners Access
                  </p>
                  <p className="text-[11.5px] text-[#90aead] mt-0.5 leading-relaxed">
                    Enter your <strong className="text-white">registered email address</strong> to receive an instant verification code. Already registered? Your race bib, results &amp; certificates link automatically!
                  </p>
                </div>
              </div>
            </div>

          <div className="mt-4 w-full">
            <ClerkLoading>
              <div className="w-full rounded-2xl border border-(--line) bg-(--panel) p-6">
                <div className="h-5 w-32 rounded-full bg-(--panel-soft)" />
                <div className="mt-6 h-11 rounded-lg bg-(--panel-soft)" />
                <div className="mt-3 h-11 rounded-lg bg-(--panel-soft)" />
                <div className="mt-6 h-10 rounded-full bg-(--foreground)/10" />
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <ThemedSignIn />
            </ClerkLoaded>
          </div>

          {/* Quick runner lookup by Bib, Email, or Phone */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-xs font-semibold text-[#fbe9d0]">
              Already registered for a race?
            </p>
            <p className="mt-1 text-[0.75rem] text-[#90aead]">
              Instant race bib, medal tracking &amp; certificate lookup:
            </p>
            <form onSubmit={handleRunnerLookup} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Enter Bib, Email, or Phone"
                value={bibInput}
                onChange={(e) => setBibInput(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-[#14242a] px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-[#e64833]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#e64833] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#d83d28]"
              >
                View Status
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-(--muted)">
            New here?{" "}
            <Link className="inline-flex items-center gap-1 font-semibold text-[#e64833] hover:text-[#d83d28]" href="/sign-up">
              Create an account <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link
              href="/admin"
              className="text-[0.72rem] text-[#90aead]/60 hover:text-[#90aead]"
            >
              Admin Console Access →
            </Link>
          </div>
          </div>
        </div>
      </section>
      </div>
    </PageShell>
  );
}
