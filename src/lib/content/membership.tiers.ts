/** Bacaan tier membership publik — lihat `membership.ts`. */
import { cacheLife, cacheTag } from "next/cache";

import { formatMembershipPriceLabel } from "@/lib/domain/pricing";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type MembershipTier = {
  id: string;
  slug: string;
  name: string;
  /** Harga angka dari modul Harga; null = harga non-angka (contoh "Custom"). */
  priceIdr: number | null;
  priceLabel: string;
  billingNote: string | null;
  summary: string | null;
  benefits: string[];
  terms: string | null;
};

/** Semua tier membership yang published, urut sesuai `sortOrder`. */
export async function getMembershipTiers(): Promise<MembershipTier[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.membership);

  const { data, usedFallback } = await safeQueryWithMeta<MembershipTier[]>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.membershipTier.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        priceIdr: row.priceIdr,
        priceLabel: row.priceLabel,
        billingNote: row.billingNote,
        summary: row.summary,
        benefits: row.benefits ?? [],
        terms: row.terms,
      }));
    },
    [],
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/**
 * Label harga tier untuk ditampilkan. Angka dari modul Harga menang supaya
 * perubahan harga admin selalu tampil; `priceLabel` dipakai hanya untuk harga
 * non-angka yang memang diketik manual (contoh "Custom").
 */
export function membershipPriceText(tier: MembershipTier): string {
  return tier.priceIdr === null
    ? tier.priceLabel
    : formatMembershipPriceLabel(tier.priceIdr);
}