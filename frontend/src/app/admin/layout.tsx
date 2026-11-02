import type { Metadata } from "next";
import { AdminShell } from "./admin-shell";
import { AdminEventProvider } from "./admin-event-context";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminEventProvider>
      <AdminShell>{children}</AdminShell>
    </AdminEventProvider>
  );
}
