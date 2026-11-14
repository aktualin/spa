"use server";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Semua baris template (urut key) untuk halaman admin. */
export async function listWhatsAppTemplateRows() {
  await requireSession();
  return prisma.whatsAppTemplate.findMany({
    orderBy: { key: "asc" },
    select: { id: true, key: true, label: true, message: true, updatedAt: true },
  });
}

/** Nomor WhatsApp mentah dari pengaturan situs (untuk pratinjau tautan). */
export async function getSettingsWhatsAppNumber(): Promise<string | null> {
  await requireSession();
  const row = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { whatsappNumber: true },
  });
  return row?.whatsappNumber ?? null;
}