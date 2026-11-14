/** Tipe & pemetaan baris promo publik — lihat `promos.ts`. */

export type PublicPromo = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  terms: string | null;
  startDate: Date | null;
  endDate: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
};

export type PromoRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  terms: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  whatsappMessage: string | null;
};

export async function queryPromoRows(): Promise<PromoRow[]> {
  const { prisma } = await import("@/lib/prisma");
  return prisma.promo.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { startDate: "asc" }],
  });
}

/** Baris DB → promo publik (kolom `isPublished` tidak ikut keluar). */
export function toPublicPromo(row: PromoRow): PublicPromo {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    bannerUrl: row.bannerUrl,
    terms: row.terms,
    startDate: row.startDate,
    endDate: row.endDate,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    whatsappMessage: row.whatsappMessage,
  };
}