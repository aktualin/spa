import type { NextRequest, NextResponse } from "next/server";

import { RESERVED_ROOT_SEGMENTS, validatePageSlug } from "@/lib/domain/page-url";
import { isPromoActive } from "@/lib/domain/visibility";
import { fetchPromoPeriod, getPromoPeriods, getPublishedPageSlugs } from "@/lib/redirects";

import { decodeURIComponentSafe, isReadRequest, notFound } from "./proxy.helpers";

// Segmen di bawah /promos yang punya route statis sendiri (bukan slug promo).
const PROMO_STATIC_SEGMENTS = ["membership"];

/**
 * `/[slug]` merender notFound() di dalam Suspense, setelah shell terkirim
 * dengan status 200 (soft-404). Path satu segmen yang bukan route lain dan
 * bukan halaman terbit dijawab 404 di sini agar mesin pencari tidak
 * mengindeksnya. Bila daftar halaman belum pernah termuat (database
 * bermasalah), jangan menebak — biarkan halaman yang memutuskan.
 */
export async function notFoundForUnknownPage(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!isReadRequest(request)) return null;
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

  return notFound(request);
}

/**
 * `/promos/[slug]` juga merender notFound() di dalam Suspense (soft-404).
 * Promo yang belum mulai, sudah berakhir, draf, atau tidak ada dijawab 404 di
 * sini. Periode dievaluasi pada waktu request, jadi promo berhenti tampil
 * tepat saat periodenya berakhir. Sebelum menjawab 404, status dibaca ulang
 * langsung dari database supaya promo yang baru dipublikasikan tidak tertolak
 * oleh cache proxy yang belum diperbarui.
 */
export async function notFoundForInactivePromo(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!isReadRequest(request)) return null;
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

  return notFound(request);
}