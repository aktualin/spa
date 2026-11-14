/**
 * Bacaan publik membership (`MembershipTier`).
 *
 * Tanpa fallback konten statis: tabel kosong atau DB tak terbaca → daftar
 * kosong, dan halaman publik menampilkan empty state.
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  type MembershipProgramData,
  readBenefits,
  readServices,
} from "@/lib/domain/membership";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type { MembershipTier } from "./membership.tiers";
export { getMembershipTiers, membershipPriceText } from "./membership.tiers";

export type MembershipProgram = MembershipProgramData;

/**
 * Informasi program membership (singleton). Tanpa fallback statis: belum
 * pernah disimpan admin atau database tidak terbaca → `null`, dan pemanggil
 * menyembunyikan bagiannya. Isi awalnya dipasang `scripts/seed.mts`;
 * `staticMembershipProgram()` tinggal dipakai seed & form admin.
 */
export async function getMembershipProgram(): Promise<MembershipProgram | null> {
  "use cache";
  cacheTag(CONTENT_TAGS.membership);

  const { data, usedFallback } = await safeQueryWithMeta<MembershipProgram | null>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.membershipProgram.findUnique({
        where: { id: "singleton" },
      });
      if (!row) return null;
      return {
        eyebrow: row.eyebrow,
        title: row.title,
        intro: row.intro,
        priceHeadline: row.priceHeadline,
        bannerBody: row.bannerBody,
        benefits: readBenefits(row.benefits),
        servicesIntro: row.servicesIntro,
        services: readServices(row.services),
        termsHtml: row.termsHtml,
      };
    },
    null,
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}