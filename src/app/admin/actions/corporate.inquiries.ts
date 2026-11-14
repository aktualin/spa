"use server";

import type { InquiryStatus } from "@prisma/client";

import { requireRole } from "@/lib/auth";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";

import { readInquiryStatus } from "./form-utils";

const INQUIRY_PAGE_SIZE = 25;

/**
 * Daftar inquiry (ringkas, tanpa isi pesan) per halaman. Mengandung data
 * pribadi — hanya untuk ADMIN/EDITOR yang login; tidak pernah di-cache publik.
 */
export async function listCorporateInquiries(params: { status?: string; page?: string }) {
  await requireRole(CONTENT_ROLES);

  const status = readInquiryStatus(params.status);
  const where = status ? { status } : {};
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [rows, total, counts] = await Promise.all([
    prisma.corporateInquiry.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * INQUIRY_PAGE_SIZE,
      take: INQUIRY_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        company: true,
        status: true,
        createdAt: true,
        emailSentAt: true,
        emailError: true,
      },
    }),
    prisma.corporateInquiry.count({ where }),
    prisma.corporateInquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countByStatus: Record<InquiryStatus, number> = { NEW: 0, CONTACTED: 0, CLOSED: 0 };
  for (const row of counts) countByStatus[row.status] = row._count._all;

  return {
    rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / INQUIRY_PAGE_SIZE)),
    status,
    countByStatus,
  };
}

export async function getCorporateInquiry(id: string) {
  await requireRole(CONTENT_ROLES);
  return prisma.corporateInquiry.findUnique({ where: { id } });
}