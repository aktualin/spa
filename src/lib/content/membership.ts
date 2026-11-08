/**
 * Bacaan publik membership (`MembershipTier`).
 *
 * Fallback memakai data statis `membership` di `src/data/content.ts` (paket
 * Individual / Keluarga / Tim KAMA) supaya halaman tetap punya isi ketika DB
 * kosong atau belum terisi.
 */
import { cacheLife, cacheTag } from "next/cache";

import { membership as staticMembership } from "@/data/pages";
import {
  type MembershipProgramData,
  readBenefits,
  readServices,
  staticMembershipProgram,
} from "@/lib/domain/membership";
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
      // Fallback statis hanya bila tabel benar-benar kosong. Bila semua tier
      // berstatus draf, halaman publik memang tidak menampilkan tier.
      const all = await prisma.membershipTier.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
      if (all.length === 0) throw new Error("tier membership kosong");
      const rows = all.filter((row) => row.isPublished);
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

export type MembershipProgram = MembershipProgramData;

/**
 * Informasi program membership (singleton). Belum pernah disimpan admin /
 * database bermasalah → isi statis lama, sehingga tampilan tidak berubah.
 */
export async function getMembershipProgram(): Promise<MembershipProgram> {
  "use cache";
  cacheTag(CONTENT_TAGS.membership);

  const { data, usedFallback } = await safeQueryWithMeta<MembershipProgram>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.membershipProgram.findUnique({
        where: { id: "singleton" },
      });
      if (!row) throw new Error("program membership belum diisi");
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
    staticMembershipProgram(),
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
