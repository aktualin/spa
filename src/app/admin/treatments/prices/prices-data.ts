import { prisma } from "@/lib/prisma";

/** Semua baris harga untuk halaman Harga (kategori, package, tier, retail). */
export async function loadPriceData() {
  const [categories, packages, tiers, products] = await Promise.all([
    prisma.treatmentCategory.findMany({
      // Urutan enum CategoryKind: TREATMENT lalu ADDON.
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        name: true,
        kind: true,
        treatments: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            options: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                label: true,
                durationMin: true,
                priceIdr: true,
              },
            },
          },
        },
      },
    }),
    prisma.package.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, durationMin: true, priceIdr: true },
    }),
    prisma.membershipTier.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, priceIdr: true, priceLabel: true },
    }),
    prisma.retailProduct.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, priceIdr: true },
    }),
  ]);
  return { categories, packages, tiers, products };
}

export type PriceData = Awaited<ReturnType<typeof loadPriceData>>;