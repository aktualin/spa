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
  staticMembershipProgram,
} from "@/lib/domain/membership";
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
