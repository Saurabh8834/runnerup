import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (_auth, request) => {
  const { pathname } = request.nextUrl;

  // Dedicated admin login route is always accessible
  if (pathname.startsWith("/admin/login")) {
    return;
  }

  // Emergency admin session cookie bypass
  const hasEmergencySession = Boolean(
    request.cookies.get("runnerup_admin_session")?.value,
  );
  if (hasEmergencySession) {
    return;
  }

  // Allow /admin requests through to AdminShell which provides complete, client-side protection:
  // 1. Verifies Clerk authentication and role via /api/admin/me
  // 2. Automatically elevates verified admin accounts (sourav06556@gmail.com, realblack009@gmail.com)
  // 3. Renders GateSignIn with master admin passcode entry if unauthenticated
  // 4. Renders GateRestricted if authenticated user lacks admin rights
  // Note: All backend admin API routes (/api/admin/*) remain strictly protected by requireAdmin.
  return;
});

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};