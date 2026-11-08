import { NextResponse, type NextRequest } from "next/server";

import { CHANGE_PASSWORD_PATH } from "@/lib/domain/admin-redirect";
import { isSameOrigin, isStateChangingMethod } from "@/lib/domain/same-origin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Proxy (pengganti middleware di Next.js 16) — hanya verifikasi JWT, tidak
// boleh menyentuh Prisma agar tetap ringan & Edge-safe. Pencocokan sesi dengan
// database (akun aktif, sessionVersion) dan role dilakukan di src/lib/auth.ts.
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    return guardAdminApi(request);
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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
