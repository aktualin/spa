import { NextResponse, type NextRequest } from "next/server";

import { CHANGE_PASSWORD_PATH } from "@/lib/domain/admin-redirect";
import { isSameOrigin, isStateChangingMethod } from "@/lib/domain/same-origin";
import { ADMIN_AUTH_DISABLED, SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Guard halaman /admin. Hanya verifikasi JWT; pencocokan sesi dengan database
 * (akun aktif, sessionVersion) dan role dilakukan di src/lib/auth.ts.
 */
export async function guardAdminPage(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname, searchParams } = request.nextUrl;

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

export async function guardAdminApi(request: NextRequest) {
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