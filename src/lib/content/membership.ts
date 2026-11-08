/**
 * Bacaan publik membership (`MembershipTier`).
 *
 * Fallback memakai data statis `membership` di `src/data/content.ts` (paket
 * Individual / Keluarga / Tim KAMA) supaya halaman tetap punya isi ketika DB
 * kosong atau belum terisi.
 */
import { cacheLife, cacheTag } from "next/cache";

import { membership as staticMembership } from "@/data/pages";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type MembershipTier = {
  id: string;
  slug: string;
  name: string;
  priceLabel: string;
  billingNote: string | null;
  summary: string | null;
  benefits: string[];
  terms: string | null;
};

function staticTiers(): MembershipTier[] {
  return staticMembership.plans.map((plan, index) => ({
    id: `static-${index}`,
    slug: plan.name.toLowerCase().replace(/\s+/g, "-"),
    name: plan.name,
    priceLabel: plan.price,
    billingNote: plan.billed,
    summary: plan.note,
    benefits: plan.features,
    terms: null,
  }));
}

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
      if (rows.length === 0) throw new Error("tier membership kosong");
      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        priceLabel: row.priceLabel,
        billingNote: row.billingNote,
        summary: row.summary,
        benefits: row.benefits ?? [],
        terms: row.terms,
      }));
    },
    staticTiers(),
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
