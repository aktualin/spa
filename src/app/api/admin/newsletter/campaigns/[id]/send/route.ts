import { NextResponse, after } from "next/server";

import { getSession } from "@/lib/auth";
import { buildNewsletterCampaignEmail } from "@/lib/domain/newsletter";
import { ADMIN_ONLY_ROLES } from "@/lib/domain/roles";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Memicu pengiriman kampanye ke semua subscriber `ACTIVE`.
 *
 * Proxy sudah menolak permintaan tanpa token dan POST lintas origin untuk
 * `/api/admin/*`. Pengecekan di sini tetap wajib karena proxy tidak
 * menyentuh database (akun dinonaktifkan/role diturunkan setelah token
 * diterbitkan tetap ditolak di sini) — sama seperti `/api/admin/upload`.
 *
 * Route Handler (bukan Server Action) karena proses kirim adalah batch job
 * panjang yang perlu bisa dipanggil ulang dengan aman (resume dari
 * `NewsletterSend`) — pola `after()` yang sama dipakai `/api/corporate-inquiry`.
 */

const SEND_DELAY_MS = 600;
const BATCH_SIZE = 25;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return json({ error: "Tidak terautentikasi." }, 401);
  if (!ADMIN_ONLY_ROLES.includes(session.role)) {
    return json({ error: "Hanya ADMIN yang bisa mengirim kampanye." }, 403);
  }

  const { id } = await params;
  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } });
  if (!campaign) return json({ error: "Kampanye tidak ditemukan." }, 404);

  if (campaign.status === "SENDING") {
    return json({ ok: true, resuming: true });
  }
  if (campaign.status !== "DRAFT") {
    return json({ error: "Kampanye ini sudah tidak berstatus draft." }, 400);
  }

  const recipientCount = await prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } });
  await prisma.newsletterCampaign.update({
    where: { id },
    data: { status: "SENDING", recipientCount },
  });

  after(() => runNewsletterSend(id));

  return json({ ok: true });
}

function errorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code);
  }
  return error instanceof Error ? error.name : "unknown";
}

async function runNewsletterSend(campaignId: string) {
  try {
    const [campaign, settings] = await Promise.all([
      prisma.newsletterCampaign.findUnique({ where: { id: campaignId } }),
      prisma.newsletterSettings.findUnique({ where: { id: "singleton" } }),
    ]);
    if (!campaign) return;

    let successCount = 0;
    let failureCount = 0;

    for (;;) {
      // Lewati subscriber yang sudah punya baris SENT — aman dipanggil ulang.
      const sentIds = await prisma.newsletterSend.findMany({
        where: { campaignId, status: "SENT" },
        select: { subscriberId: true },
      });
      const batch = await prisma.newsletterSubscriber.findMany({
        where: { status: "ACTIVE", id: { notIn: sentIds.map((row) => row.subscriberId) } },
        take: BATCH_SIZE,
      });
      if (batch.length === 0) break;

      for (const subscriber of batch) {
        const unsubscribeUrl = `${getSiteUrl()}/api/newsletter-unsubscribe?token=${subscriber.unsubscribeToken}`;
        const email = buildNewsletterCampaignEmail({
          subject: campaign.subject,
          previewText: campaign.previewText,
          bodyHtml: campaign.bodyHtml,
          headerHtml: settings?.headerHtml ?? null,
          footerHtml: settings?.footerHtml ?? null,
          unsubscribeUrl,
          physicalAddress: settings?.physicalAddress ?? null,
          unsubscribeNotice: settings?.unsubscribeNotice ?? null,
        });

        const result = await sendEmail({
          to: [subscriber.email],
          subject: email.subject,
          text: email.text,
          html: email.html,
          replyTo: settings?.replyTo ?? null,
        });

        await prisma.newsletterSend.upsert({
          where: { campaignId_subscriberId: { campaignId, subscriberId: subscriber.id } },
          create: {
            campaignId,
            subscriberId: subscriber.id,
            status: result.ok ? "SENT" : "FAILED",
            error: result.ok ? null : result.error.slice(0, 300),
            sentAt: result.ok ? new Date() : null,
          },
          update: {
            status: result.ok ? "SENT" : "FAILED",
            error: result.ok ? null : result.error.slice(0, 300),
            sentAt: result.ok ? new Date() : null,
          },
        });

        if (result.ok) successCount += 1;
        else failureCount += 1;

        await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));
      }

      await prisma.newsletterCampaign.update({
        where: { id: campaignId },
        data: { successCount, failureCount },
      });
    }

    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: successCount > 0 ? "SENT" : "FAILED",
        sentAt: new Date(),
        successCount,
        failureCount,
      },
    });
  } catch (error) {
    console.error("[newsletter-send] gagal mengirim kampanye:", errorCode(error));
    await prisma.newsletterCampaign
      .update({ where: { id: campaignId }, data: { status: "FAILED" } })
      .catch(() => {});
  }
}
