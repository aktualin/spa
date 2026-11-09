import { NextResponse, type NextRequest } from "next/server";

import {
  isBotUserAgent,
  trackablePath,
  VISITOR_COOKIE,
} from "@/lib/domain/page-view";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

import {
  newVisitorId,
  readVisitorId,
  visitorCookieOptions,
} from "@/lib/analytics/visitor";

/**
 * Beacon dari src/instrumentation-client.ts untuk navigasi client-side App
 * Router. Hanya path publik yang valid yang disimpan; sesi admin dan bot
 * diabaikan. Selalu membalas 204 supaya kegagalan analitik tidak terlihat
 * oleh pengunjung.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (request.cookies.has(SESSION_COOKIE)) {
    return new NextResponse(null, { status: 204 });
  }
  if (isBotUserAgent(request.headers.get("user-agent"))) {
    return new NextResponse(null, { status: 204 });
  }

  let payload: { path?: unknown };
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const path =
    typeof payload.path === "string" ? trackablePath(payload.path) : null;
  if (!path) return new NextResponse(null, { status: 204 });

  let visitorId = readVisitorId(request.cookies.get(VISITOR_COOKIE)?.value);
  const isNewVisitor = !visitorId;
  visitorId ??= newVisitorId();

  const response = new NextResponse(null, { status: 204 });
  if (isNewVisitor) {
    response.cookies.set(
      VISITOR_COOKIE,
      visitorId,
      visitorCookieOptions(),
    );
  }

  try {
    await prisma.pageView.create({ data: { path, visitorId } });
  } catch (error) {
    console.warn(
      "[analitik] Gagal mencatat tampilan halaman:",
      error instanceof Error ? error.message : error,
    );
  }

  return response;
}
