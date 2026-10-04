import type { Metadata } from "next";
import { PageShell } from "../components/app-shell";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Athlete Dashboard | RunnerUp India",
  description: "Manage your registered races, upload GPS activity proofs, track finisher medal shipments, and download official certificates.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <PageShell>
      <DashboardClient />
    </PageShell>
  );
}

