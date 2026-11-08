import { NextResponse, type NextRequest } from "next/server";

import { CHANGE_PASSWORD_PATH } from "@/lib/domain/admin-redirect";
import { isSameOrigin, isStateChangingMethod } from "@/lib/domain/same-origin";
import {
  RESERVED_ROOT_SEGMENTS,
  resolveRedirect,
  validatePageSlug,
} from "@/lib/domain/page-url";
import { isPromoActive } from "@/lib/domain/visibility";
import {
  fetchPromoPeriod,
  getPromoPeriods,
  getPublishedPageSlugs,
  getRedirectMap,
} from "@/lib/redirects";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Segmen di bawah /promos yang punya route statis sendiri (bukan slug promo).
const PROMO_STATIC_SEGMENTS = ["membership"];

// Proxy (pengganti middleware di Next.js 16). Guard admin hanya verifikasi JWT;
// pencocokan sesi dengan database (akun aktif, sessionVersion) dan role
// dilakukan di src/lib/auth.ts. Redirect publik dibaca dari cache di memori.
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    return guardAdminApi(request);
  }

  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return (
      (await applyRedirect(request)) ??
      (await notFoundForUnknownPage(request)) ??
      (await notFoundForInactivePromo(request)) ??
      NextResponse.next()
    );
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
