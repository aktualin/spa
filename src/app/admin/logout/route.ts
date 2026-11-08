import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/session";

/**
 * POST /admin/logout — hapus cookie sesi lalu kembali ke halaman login.
 * Setara dengan `logoutAction` di `../actions/auth.ts`, tapi berupa route
 * sungguhan (sesuai 02-sitemap-final.md) supaya bisa dipanggil dari form
 * HTML biasa tanpa JavaScript.
 */
export async function POST(request: NextRequest) {
  // Tolak POST lintas-situs. Cookie sesi sendiri sudah sameSite=lax, ini
  // lapis kedua. Host dicek dari header `host` (bukan nextUrl.origin) supaya
  // tidak salah saat aplikasi berjalan di belakang reverse proxy.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = null;
    }
    if (originHost && originHost !== host) {
      return new NextResponse("Origin tidak diizinkan.", { status: 403 });
    }
  }

  // 303 supaya browser mengikuti redirect dengan GET.
  const response = NextResponse.redirect(
    new URL("/admin/login", request.url),
    303,
  );
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

/** GET tidak boleh mengubah state (mis. prefetch) — cukup arahkan ke dashboard. */
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/admin", request.url));
}
