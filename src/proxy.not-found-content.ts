import type { NextRequest, NextResponse } from "next/server";

import { isValidSlug } from "@/lib/domain/slug";
import { isJournalVisible } from "@/lib/domain/visibility";
import {
  fetchEventPublished,
  fetchJournalVisibility,
  getJournalVisibility,
  getPublishedEventSlugs,
} from "@/lib/redirects";

import { decodeURIComponentSafe, isReadRequest, notFound } from "./proxy.helpers";

// Segmen di bawah /events yang punya route statis sendiri (bukan slug event).
const EVENT_STATIC_SEGMENTS = ["collaborations"];

/**
 * `/our-story/journal/[slug]` juga merender notFound() di dalam Suspense
 * (soft-404). Artikel draf, terjadwal yang belum tiba waktunya, atau tidak ada
 * dijawab 404 di sini. Visibilitas dievaluasi pada waktu request, jadi artikel
 * terjadwal mulai bisa dibuka tepat saat jadwalnya tiba. Sebelum menjawab 404,
 * status dibaca ulang langsung dari database supaya artikel yang baru
 * diterbitkan tidak tertolak oleh cache proxy yang belum diperbarui.
 */
export async function notFoundForHiddenJournalPost(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!isReadRequest(request)) return null;
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

  return notFound(request);
}

/**
 * `/events/[slug]` juga merender notFound() di dalam Suspense (soft-404).
 * Event draf atau tidak ada dijawab 404 di sini. Sebelum menjawab 404, status
 * dibaca ulang langsung dari database supaya event yang baru diterbitkan tidak
 * tertolak oleh cache proxy yang belum diperbarui.
 */
export async function notFoundForUnpublishedEvent(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!isReadRequest(request)) return null;
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

  return notFound(request);
}