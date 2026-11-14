import { NextResponse, type NextRequest } from "next/server";

/** Hanya permintaan baca (GET/HEAD) yang lewat guard redirect & 404. */
export function isReadRequest(request: NextRequest): boolean {
  return request.method === "GET" || request.method === "HEAD";
}

export function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Jawab 404 lewat rewrite ke /_not-found. Halaman publik merender notFound()
 * di dalam Suspense (soft-404 dengan status 200); rewrite ini memastikan
 * status respons benar-benar 404 agar mesin pencari tidak mengindeksnya.
 */
export function notFound(request: NextRequest): NextResponse {
  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
  });
}