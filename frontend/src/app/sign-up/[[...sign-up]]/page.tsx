"use client";

import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { ChevronRight, Medal, Route } from "lucide-react";
import { PageShell } from "../../components/app-shell";
import { useTheme } from "../../components/theme-provider";

function ThemedSignUp() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const card = document.querySelector("[class*='cl-card'], [class*='cl-internal']");
      if (card) {
        const form = card.querySelector("form");
        if (form) { form.noValidate = true; observer.disconnect(); }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
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
          socialButtonsBlockButton: dark
            ? "border-white/10 bg-[#14242a] text-white hover:bg-[#1b323b] h-11 font-semibold"
            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 h-11 font-semibold shadow-xs",
          socialButtonsBlockButtonText: dark ? "text-white" : "text-slate-800",
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
              <p className="mt-3 text-sm leading-6 text-(--muted)">Sign up with Google or email. You&apos;ll land on your runner portal after.</p>
            </div>
          <div className="mt-6 w-full sm:mt-8">
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
