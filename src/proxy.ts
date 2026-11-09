import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

import { trackPageView } from "@/lib/analytics/track";

import { CHANGE_PASSWORD_PATH } from "@/lib/domain/admin-redirect";
import { isSameOrigin, isStateChangingMethod } from "@/lib/domain/same-origin";
import {
  RESERVED_ROOT_SEGMENTS,
  resolveRedirect,
  validatePageSlug,
} from "@/lib/domain/page-url";
import { isValidSlug } from "@/lib/domain/slug";
import { isJournalVisible, isPromoActive } from "@/lib/domain/visibility";
import {
  fetchEventPublished,
  fetchJournalVisibility,
  fetchPromoPeriod,
  getJournalVisibility,
  getPromoPeriods,
  getPublishedEventSlugs,
  getPublishedPageSlugs,
  getRedirectMap,
} from "@/lib/redirects";
import { ADMIN_AUTH_DISABLED, SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Segmen di bawah /promos yang punya route statis sendiri (bukan slug promo).
const PROMO_STATIC_SEGMENTS = ["membership"];
// Segmen di bawah /events yang punya route statis sendiri (bukan slug event).
const EVENT_STATIC_SEGMENTS = ["collaborations"];

// Proxy (pengganti middleware di Next.js 16). Guard admin hanya verifikasi JWT;
// pencocokan sesi dengan database (akun aktif, sessionVersion) dan role
// dilakukan di src/lib/auth.ts. Redirect publik dibaca dari cache di memori.
export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname, searchParams } = request.nextUrl;

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

  // Login dimatikan sementara: /admin bebas diakses, /admin/login dialihkan ke
  // dashboard. Sesi aktif tetap diisi oleh `getSession()` (lihat lib/auth.ts).
  if (ADMIN_AUTH_DISABLED) {
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Sesi dicabut di database (password/role/status berubah): hapus cookie lewat
  // redirect, supaya request berikutnya benar-benar datang tanpa cookie lama.
  if (pathname === "/admin/login" && searchParams.get("reason") === "expired") {
    const clean = new URL("/admin/login", request.url);
    const next = searchParams.get("next");
    if (next) clean.searchParams.set("next", next);
    clean.searchParams.set("expired", "1");
    const response = NextResponse.redirect(clean);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname === "/admin/login") {
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    // Supaya setelah login user kembali ke halaman yang tadi dituju.
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    session.mustChangePassword &&
    pathname !== CHANGE_PASSWORD_PATH &&
    !pathname.startsWith("/admin/logout")
  ) {
    return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url));
  }

  return NextResponse.next();
}

async function applyRedirect(request: NextRequest): Promise<NextResponse | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/" || pathname.startsWith("/api/")) return null;

  try {
    const target = resolveRedirect(await getRedirectMap(), pathname);
    if (!target) return null;

    if (!target.toPath.startsWith("/")) {
      return NextResponse.redirect(target.toPath, target.statusCode);
    }

    const destination = new URL(target.toPath, request.url);
    // Query milik tujuan menang; sisanya dibawa dari URL lama (mis. utm_*).
    for (const key of new Set(searchParams.keys())) {
      if (destination.searchParams.has(key)) continue;
      for (const value of searchParams.getAll(key)) {
        destination.searchParams.append(key, value);
      }
    }
    if (destination.href === request.nextUrl.href) return null;
    return NextResponse.redirect(destination, target.statusCode);
  } catch (error) {
    console.warn("[proxy] Redirect dilewati:", error);
    return null;
  }
}

/**
 * `/[slug]` merender notFound() di dalam Suspense, setelah shell terkirim
 * dengan status 200 (soft-404). Path satu segmen yang bukan route lain dan
 * bukan halaman terbit dijawab 404 di sini agar mesin pencari tidak
 * mengindeksnya. Bila daftar halaman belum pernah termuat (database
 * bermasalah), jangan menebak — biarkan halaman yang memutuskan.
 */
async function notFoundForUnknownPage(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const match = /^\/([^/]+)$/.exec(request.nextUrl.pathname);
  if (!match) return null;

  const segment = decodeURIComponentSafe(match[1]);
  if (RESERVED_ROOT_SEGMENTS.includes(segment)) return null;

  if (validatePageSlug(segment) === null) {
    try {
      const published = await getPublishedPageSlugs();
      if (!published.loaded || published.value.has(segment)) return null;
    } catch {
      return null;
    }
  }

  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
  });
}

/**
 * `/promos/[slug]` juga merender notFound() di dalam Suspense (soft-404).
 * Promo yang belum mulai, sudah berakhir, draf, atau tidak ada dijawab 404 di
 * sini. Periode dievaluasi pada waktu request, jadi promo berhenti tampil
 * tepat saat periodenya berakhir. Sebelum menjawab 404, status dibaca ulang
 * langsung dari database supaya promo yang baru dipublikasikan tidak tertolak
 * oleh cache proxy yang belum diperbarui.
 */
async function notFoundForInactivePromo(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const match = /^\/promos\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (!match) return null;

  const slug = decodeURIComponentSafe(match[1]);
  // Route statis di bawah /promos.
  if (PROMO_STATIC_SEGMENTS.includes(slug)) return null;

  const now = new Date();
  const cached = await getPromoPeriods();
  const fromCache = cached.value.get(slug);
  if (fromCache && isPromoActive(fromCache, now)) return null;

  const fresh = await fetchPromoPeriod(slug);
  if (fresh === undefined) return null; // database bermasalah: jangan menebak
  if (fresh && isPromoActive(fresh, now)) return null;

  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
  });
}

/**
 * `/our-story/journal/[slug]` juga merender notFound() di dalam Suspense
 * (soft-404). Artikel draf, terjadwal yang belum tiba waktunya, atau tidak ada
 * dijawab 404 di sini. Visibilitas dievaluasi pada waktu request, jadi artikel
 * terjadwal mulai bisa dibuka tepat saat jadwalnya tiba. Sebelum menjawab 404,
 * status dibaca ulang langsung dari database supaya artikel yang baru
 * diterbitkan tidak tertolak oleh cache proxy yang belum diperbarui.
 */
async function notFoundForHiddenJournalPost(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const match = /^\/our-story\/journal\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (!match) return null;

  const slug = decodeURIComponentSafe(match[1]);
  // Slug yang tidak mungkin dibuat admin tidak perlu ditanyakan ke database.
  if (isValidSlug(slug)) {
    const now = new Date();
    const cached = await getJournalVisibility();
    const fromCache = cached.value.get(slug);
    if (fromCache && isJournalVisible(fromCache, now)) return null;

    const fresh = await fetchJournalVisibility(slug);
    if (fresh === undefined) return null; // database bermasalah: jangan menebak
    if (fresh && isJournalVisible(fresh, now)) return null;
  }

  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
  });
}

/**
 * `/events/[slug]` juga merender notFound() di dalam Suspense (soft-404).
 * Event draf atau tidak ada dijawab 404 di sini. Sebelum menjawab 404, status
 * dibaca ulang langsung dari database supaya event yang baru diterbitkan tidak
 * tertolak oleh cache proxy yang belum diperbarui.
 */
async function notFoundForUnpublishedEvent(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const match = /^\/events\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (!match) return null;

  const slug = decodeURIComponentSafe(match[1]);
  // Route statis di bawah /events.
  if (EVENT_STATIC_SEGMENTS.includes(slug)) return null;

  if (isValidSlug(slug)) {
    const cached = await getPublishedEventSlugs();
    if (cached.value.has(slug)) return null;

    const published = await fetchEventPublished(slug);
    if (published !== false) return null; // terbit, atau database bermasalah
  }

  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
  });
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function guardAdminApi(request: NextRequest) {
  if (isStateChangingMethod(request.method) && !isSameOrigin(request.headers)) {
    return NextResponse.json({ error: "Origin tidak diizinkan." }, { status: 403 });
  }

  // Login dimatikan sementara: API admin terbuka tanpa cookie. Pemeriksaan
  // origin di atas tetap dipertahankan agar situs lain tidak bisa menulis.
  if (ADMIN_AUTH_DISABLED) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  if (session.mustChangePassword) {
    return NextResponse.json(
      { error: "Ganti kata sandi terlebih dahulu." },
      { status: 403 },
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Halaman publik saja: tanpa /api, aset Next, folder img, dan berkas berekstensi.
    "/((?!api(?:/|$)|_next/|img/|favicon\\.ico$|.*\\.\\w+$).*)",
  ],
};
