import type { promoEndingSoonRange } from "@/lib/domain/admin-dashboard";
import { prisma } from "@/lib/prisma";

import { contentSpotCounts } from "./page.data";

/** Semua angka mentah dashboard dalam satu Promise.all paralel. */
export async function fetchDashboardCounts(
  now: Date,
  chartSince: Date,
  endingSoon: ReturnType<typeof promoEndingSoonRange>,
  isAdmin: boolean,
) {
  return Promise.all([
    prisma.treatment.count({ where: { isPublished: true } }),
    prisma.package.count({ where: { isPublished: true } }),
    prisma.promo.count({
      where: {
        isPublished: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
    }),
    prisma.journalPost.count({ where: { status: "PUBLISHED" } }),
    prisma.eventItem.count({
      where: {
        isPublished: true,
        OR: [{ startDate: null }, { startDate: { gte: now } }],
      },
    }),
    prisma.corporateInquiry.count({ where: { status: "NEW" } }),
    prisma.journalPost.count({
      where: { status: "SCHEDULED", OR: [{ publishedAt: null }, { publishedAt: { gt: now } }] },
    }),
    prisma.journalPost.count({
      where: { status: "SCHEDULED", publishedAt: { lte: now } },
    }),
    prisma.promo.count({ where: { isPublished: true, endDate: endingSoon } }),
    contentSpotCounts(),
    isAdmin
      ? prisma.backupRun.findFirst({
          where: { kind: "AUTO", status: "SUCCESS" },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        })
      : Promise.resolve(null),
    prisma.journalPost.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: chartSince } },
      select: { publishedAt: true },
    }),
    prisma.corporateInquiry.findMany({
      where: { createdAt: { gte: chartSince } },
      select: { createdAt: true },
    }),
    prisma.journalPost.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);
}