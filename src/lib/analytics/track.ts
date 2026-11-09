import type { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import {
  trackablePageView,
  VISITOR_COOKIE,
} from "@/lib/domain/page-view";
import { SESSION_COOKIE } from "@/lib/session";

import {
  newVisitorId,
  readVisitorId,
  visitorCookieOptions,
} from "./visitor";

async function recordPageView(path: string, visitorId: string): Promise<void> {
  try {
    // Dynamic import supaya request admin/aset tidak ikut memuat Prisma.
    const { prisma } = await import("@/lib/prisma");
    await prisma.pageView.create({ data: { path, visitorId } });
  } catch (error) {
    // Analitik tidak boleh mengganggu halaman publik.
    console.warn(
      "[analitik] Gagal mencatat tampilan halaman:",
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Catat satu muat penuh halaman publik tanpa menahan respons. Navigasi
 * client-side (App Router) dicatat terpisah oleh src/instrumentation-client.ts
 * karena header prefetch dibuang Next sebelum proxy sempat membacanya.
 */
export function trackPageView(
  request: NextRequest,
  response: NextResponse,
  event: NextFetchEvent,
): void {
  const path = trackablePageView({
    method: request.method,
    pathname: request.nextUrl.pathname,
    headers: request.headers,
    hasAdminSession: request.cookies.has(SESSION_COOKIE),
  });
  if (!path) return;

  let visitorId = readVisitorId(request.cookies.get(VISITOR_COOKIE)?.value);
  if (!visitorId) {
    visitorId = newVisitorId();
    response.cookies.set(
      VISITOR_COOKIE,
      visitorId,
      visitorCookieOptions(),
    );
  }

  event.waitUntil(recordPageView(path, visitorId));
}
