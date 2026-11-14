import { prisma } from "@/lib/prisma";

/** Semua sumber meta halaman publik: entri SEO + konten yang punya field SEO. */
export async function fetchOverviewSources() {
  const [entries, categories, treatments, packages, posts, events, promos, pages, story] =
    await Promise.all([
      prisma.pageSeo.findMany({ orderBy: { path: "asc" } }),
      prisma.treatmentCategory.findMany({
        where: { kind: "TREATMENT" },
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, name: true, description: true, isPublished: true, seoTitle: true, seoDescription: true },
      }),
      prisma.treatment.findMany({
        where: { category: { kind: "TREATMENT" } },
        orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          isPublished: true,
          seoTitle: true,
          seoDescription: true,
          category: { select: { slug: true, isPublished: true } },
        },
      }),
      prisma.package.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, name: true, description: true, isPublished: true, seoTitle: true, seoDescription: true },
      }),
      prisma.journalPost.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: { id: true, slug: true, title: true, excerpt: true, status: true, publishedAt: true, seoTitle: true, seoDescription: true },
      }),
      prisma.eventItem.findMany({
        orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
        select: { id: true, slug: true, title: true, description: true, isPublished: true, seoTitle: true, seoDescription: true },
      }),
      prisma.promo.findMany({
        orderBy: [{ sortOrder: "asc" }, { startDate: "asc" }],
        select: { id: true, slug: true, title: true, description: true, isPublished: true, endDate: true, seoTitle: true, seoDescription: true },
      }),
      prisma.staticPage.findMany({
        orderBy: { slug: "asc" },
        select: { id: true, slug: true, title: true, status: true, seoTitle: true, seoDescription: true },
      }),
      prisma.ourStoryContent.findUnique({
        where: { id: "singleton" },
        select: { seoTitle: true, seoDescription: true },
      }),
    ]);
  return { entries, categories, treatments, packages, posts, events, promos, pages, story };
}

export type OverviewSources = Awaited<ReturnType<typeof fetchOverviewSources>>;