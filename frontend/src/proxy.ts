import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  const host = request.headers.get("host") || "";
  if (host.startsWith("www.runnerup.in")) {
    const url = new URL(request.url);
    url.host = "runnerup.in";
    url.protocol = "https:";
    return Response.redirect(url.toString(), 308);
  }

  // Allow dedicated admin login route without Clerk protection
  if (pathname.startsWith("/admin/login")) {
    return;
  }

  // If authenticated via emergency admin passcode session cookie, allow access
  const hasEmergencySession = Boolean(
    request.cookies.get("runnerup_admin_session")?.value,
  );
  if (hasEmergencySession && pathname.startsWith("/admin")) {
    return;
  }

  if (pathname.startsWith("/admin")) {
    await auth.protect({
      unauthenticatedUrl: new URL(
        `/admin/login?redirect_url=${encodeURIComponent(pathname)}`,
        request.url,
      ).toString(),
    });
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/dashboard/:path*",
  ],
};