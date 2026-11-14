import { NextResponse, type NextRequest } from "next/server";

import { resolveRedirect } from "@/lib/domain/page-url";
import { getRedirectMap } from "@/lib/redirects";

import { isReadRequest } from "./proxy.helpers";

/** Redirect publik dari cache di memori; query lama (mis. utm_*) ikut dibawa. */
export async function applyRedirect(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!isReadRequest(request)) return null;
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