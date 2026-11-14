import {
  journalStatusSegments,
  monthlyTrend,
  type DashboardAlert,
  type JournalStatusSegment,
  type MonthBucket,
  type TrendPoint,
} from "@/lib/domain/admin-dashboard";
import { prisma } from "@/lib/prisma";

export type Summary = {
  treatmentsPublished: number;
  packages: number;
  promosActive: number;
  journalPublished: number;
  eventsUpcoming: number;
};

export type ContentSummary = {
  summary: Summary;
  alerts: DashboardAlert[];
  journalTrend: TrendPoint[];
  inquiryTrend: TrendPoint[];
  statusSegments: JournalStatusSegment[];
  summaryError: boolean;
};

/** Nilai awal ringkasan: semua nol, untuk saat query DB gagal. */
export function emptyContentSummary(buckets: MonthBucket[]): ContentSummary {
  return {
    summary: {
      treatmentsPublished: 0,
      packages: 0,
      promosActive: 0,
      journalPublished: 0,
      eventsUpcoming: 0,
    },
    alerts: [],
    journalTrend: monthlyTrend([], buckets),
    inquiryTrend: monthlyTrend([], buckets),
    statusSegments: journalStatusSegments({ PUBLISHED: 0, SCHEDULED: 0, DRAFT: 0 }),
    summaryError: false,
  };
}

/**
 * Jumlah baris tiap tempat konten di `CONTENT_SPOTS`. Satu query per tabel,
 * semuanya paralel; kunci hasilnya sama dengan `ContentSpot.key`.
 */
export async function contentSpotCounts(): Promise<Record<string, number>> {
  const [
    homepageHighlight,
    homepageReview,
    homepageStat,
    instagramPost,
    contentBlock,
    branch,
    galleryPhoto,
    retailProduct,
    menuItem,
    staticPage,
  ] = await Promise.all([
    prisma.homepageHighlight.count(),
    prisma.homepageReview.count(),
    prisma.homepageStat.count(),
    prisma.instagramPost.count(),
    prisma.contentBlock.count(),
    prisma.branch.count(),
    prisma.galleryPhoto.count(),
    prisma.retailProduct.count(),
    prisma.menuItem.count(),
    prisma.staticPage.count(),
  ]);

  return {
    homepageHighlight,
    homepageReview,
    homepageStat,
    instagramPost,
    contentBlock,
    branch,
    galleryPhoto,
    retailProduct,
    menuItem,
    staticPage,
  };
}