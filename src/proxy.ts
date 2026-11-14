import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

import { trackPageView } from "@/lib/analytics/track";

import { guardAdminApi, guardAdminPage } from "./proxy.admin";
import { notFoundForInactivePromo, notFoundForUnknownPage } from "./proxy.not-found";
import {
  notFoundForHiddenJournalPost,
  notFoundForUnpublishedEvent,
} from "./proxy.not-found-content";
import { applyRedirect } from "./proxy.redirect";

// Proxy (pengganti middleware di Next.js 16). Guard admin hanya verifikasi JWT;
// pencocokan sesi dengan database (akun aktif, sessionVersion) dan role
// dilakukan di src/lib/auth.ts. Redirect publik dibaca dari cache di memori.
// Implementasi dipecah ke modul saudara: proxy.admin, proxy.redirect,
// proxy.not-found, proxy.not-found-content, proxy.helpers.
export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    return guardAdminApi(request);
  }

  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    const handled =
      (await applyRedirect(request)) ??
      (await notFoundForUnknownPage(request)) ??
      (await notFoundForInactivePromo(request)) ??
      (await notFoundForHiddenJournalPost(request)) ??
      (await notFoundForUnpublishedEvent(request));
    // Redirect dan 404 tidak dihitung; hanya halaman publik yang benar-benar
    // dirender yang masuk analitik.
    if (handled) return handled;

    const response = NextResponse.next();
    trackPageView(request, response, event);
    return response;
  }

  return guardAdminPage(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Halaman publik saja: tanpa /api, aset Next, folder img, dan berkas berekstensi.
    "/((?!api(?:/|$)|_next/|img/|favicon\\.ico$|.*\\.\\w+$).*)",
  ],
};