"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole, requireSession } from "@/lib/auth";
import {
  generateUnsubscribeToken,
  validateNewsletterCampaignInput,
  validateNewsletterSettingsInput,
  validateNewsletterSubscribe,
} from "@/lib/domain/newsletter";
import { ADMIN_ONLY_ROLES, CONTENT_ROLES } from "@/lib/domain/roles";
import { sanitizeHtml } from "@/lib/domain/sanitize";
import { prisma } from "@/lib/prisma";

import { text } from "../promos/_kit/schema";

export type ActionState = { error: string | null; ok?: boolean };

const CAMPAIGNS_PATH = "/admin/newsletter";
const SUBSCRIBERS_PATH = "/admin/newsletter/subscribers";
const SETTINGS_PATH = "/admin/newsletter/settings";

const PAGE_SIZE = 20;

type CampaignStatus = "DRAFT" | "SENDING" | "SENT" | "FAILED";
type SubscriberStatus = "ACTIVE" | "UNSUBSCRIBED";

function readCampaignStatus(value: string | undefined): CampaignStatus | undefined {
  return value === "DRAFT" || value === "SENDING" || value === "SENT" || value === "FAILED"
    ? value
    : undefined;
}

function readSubscriberStatus(value: string | undefined): SubscriberStatus | undefined {
  return value === "ACTIVE" || value === "UNSUBSCRIBED" ? value : undefined;
}

/* ------------------------------------------------------------------ */
/* Kampanye                                                             */
/* ------------------------------------------------------------------ */

export async function listNewsletterCampaigns(params: { status?: string; page?: string }) {
  await requireRole(CONTENT_ROLES);

  const status = readCampaignStatus(params.status);
  const where = status ? { status } : {};
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [rows, total, counts] = await Promise.all([
    prisma.newsletterCampaign.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.newsletterCampaign.count({ where }),
    prisma.newsletterCampaign.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countByStatus: Record<CampaignStatus, number> = {
    DRAFT: 0,
    SENDING: 0,
    SENT: 0,
    FAILED: 0,
  };
  for (const row of counts) countByStatus[row.status] = row._count._all;

  return {
    rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    status,
    countByStatus,
  };
}

export async function getNewsletterCampaign(id: string) {
  await requireSession();
  return prisma.newsletterCampaign.findUnique({ where: { id } });
}

export async function saveNewsletterCampaignAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";

  if (id) {
    const existing = await prisma.newsletterCampaign.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!existing) return { error: "Kampanye tidak ditemukan." };
    if (existing.status !== "DRAFT") {
      return { error: "Kampanye yang sudah terkirim tidak bisa diubah." };
    }
  }

  const result = validateNewsletterCampaignInput({
    subject: text(formData, "subject") ?? "",
    previewText: text(formData, "previewText") ?? "",
    bodyHtml: sanitizeHtml(text(formData, "bodyHtml") ?? ""),
  });
  if (!result.ok) return { error: result.error };
  const data = result.data;

  if (id) {
    await prisma.newsletterCampaign.update({ where: { id }, data });
  } else {
    const session = await requireSession();
    await prisma.newsletterCampaign.create({
      data: { ...data, createdById: session.userId },
    });
  }

  revalidatePath(CAMPAIGNS_PATH);
  redirect(`${CAMPAIGNS_PATH}?saved=1`);
}

export async function deleteNewsletterCampaignAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  if (!id) return;

  const existing = await prisma.newsletterCampaign.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!existing) redirect(CAMPAIGNS_PATH);
  if (existing.status === "SENDING") {
    redirect(`${CAMPAIGNS_PATH}?error=sending`);
  }

  await prisma.newsletterCampaign.delete({ where: { id } });

  revalidatePath(CAMPAIGNS_PATH);
  redirect(`${CAMPAIGNS_PATH}?deleted=1`);
}

/* ------------------------------------------------------------------ */
/* Subscriber                                                           */
/* ------------------------------------------------------------------ */

export async function listNewsletterSubscribers(params: { status?: string; page?: string }) {
  await requireRole(CONTENT_ROLES);

  const status = readSubscriberStatus(params.status);
  const where = status ? { status } : {};
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [rows, total, counts] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { branch: { select: { name: true, area: true } } },
    }),
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countByStatus: Record<SubscriberStatus, number> = { ACTIVE: 0, UNSUBSCRIBED: 0 };
  for (const row of counts) countByStatus[row.status] = row._count._all;

  return {
    rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    status,
    countByStatus,
  };
}

export async function addNewsletterSubscriberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const validation = validateNewsletterSubscribe({
    email: text(formData, "email") ?? "",
    branchSlug: text(formData, "branchSlug") || undefined,
  });
  if (!validation.ok) return { error: validation.error };

  let branchId: string | null = null;
  if (validation.data.branchSlug) {
    const branch = await prisma.branch.findUnique({
      where: { slug: validation.data.branchSlug },
      select: { id: true },
    });
    branchId = branch?.id ?? null;
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: validation.data.email },
    create: {
      email: validation.data.email,
      branchId,
      status: "ACTIVE",
      unsubscribeToken: generateUnsubscribeToken(),
    },
    update: { status: "ACTIVE", unsubscribedAt: null, branchId },
  });

  revalidatePath(SUBSCRIBERS_PATH);
  redirect(`${SUBSCRIBERS_PATH}?saved=1`);
}

export async function toggleNewsletterSubscriberAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  const next = text(formData, "status") === "ACTIVE" ? "ACTIVE" : "UNSUBSCRIBED";
  if (!id) return;

  await prisma.newsletterSubscriber.update({
    where: { id },
    data:
      next === "ACTIVE"
        ? { status: "ACTIVE", unsubscribedAt: null }
        : { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
  });

  revalidatePath(SUBSCRIBERS_PATH);
  redirect(`${SUBSCRIBERS_PATH}?saved=1`);
}

export async function deleteNewsletterSubscriberAction(formData: FormData) {
  await requireRole(CONTENT_ROLES);

  const id = text(formData, "id")?.trim() ?? "";
  if (!id) return;

  await prisma.newsletterSubscriber.delete({ where: { id } });

  revalidatePath(SUBSCRIBERS_PATH);
  redirect(`${SUBSCRIBERS_PATH}?deleted=1`);
}

/* ------------------------------------------------------------------ */
/* Pengaturan (header/footer global)                                   */
/* ------------------------------------------------------------------ */

export async function getNewsletterSettings() {
  await requireSession();
  return prisma.newsletterSettings.findUnique({ where: { id: "singleton" } });
}

export async function saveNewsletterSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(CONTENT_ROLES);

  const result = validateNewsletterSettingsInput({
    headerHtml: sanitizeHtml(text(formData, "headerHtml") ?? ""),
    footerHtml: sanitizeHtml(text(formData, "footerHtml") ?? ""),
    senderName: text(formData, "senderName") ?? "",
    replyTo: text(formData, "replyTo") ?? "",
    physicalAddress: text(formData, "physicalAddress") ?? "",
    unsubscribeNotice: text(formData, "unsubscribeNotice") ?? "",
  });
  if (!result.ok) return { error: result.error };

  await prisma.newsletterSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...result.data },
    update: result.data,
  });

  revalidatePath(SETTINGS_PATH);
  redirect(`${SETTINGS_PATH}?saved=1`);
}

/* ------------------------------------------------------------------ */
/* Kirim (dipicu dari client island; status flip dicek di route API)   */
/* ------------------------------------------------------------------ */

/** Dipanggil halaman admin untuk menampilkan tombol "Kirim sekarang" hanya untuk ADMIN. */
export async function canSendNewsletterCampaign(): Promise<boolean> {
  const session = await requireSession();
  return ADMIN_ONLY_ROLES.includes(session.role);
}
