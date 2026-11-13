import { NextResponse } from "next/server";

/**
 * Tautan unsubscribe dari email kampanye (GET, bukan form) — token adalah
 * satu-satunya "kredensial", tidak perlu login. Idempotent: unsubscribe dua
 * kali tidak berakibat apa pun.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  const redirectTo = (status: "ok" | "invalid") =>
    NextResponse.redirect(new URL(`/newsletter/unsubscribe?status=${status}`, request.url));

  if (!token) return redirectTo("invalid");

  try {
    const { prisma } = await import("@/lib/prisma");
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { id: true },
    });
    if (!subscriber) return redirectTo("invalid");

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
    });
    return redirectTo("ok");
  } catch (error) {
    console.error(
      "[newsletter-unsubscribe] gagal memproses unsubscribe:",
      error instanceof Error ? error.name : "unknown",
    );
    return redirectTo("invalid");
  }
}
