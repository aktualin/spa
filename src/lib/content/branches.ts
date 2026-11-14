/**
 * Bacaan publik daftar cabang (modul Cabang).
 *
 * Tabel kosong atau semua cabang disembunyikan → daftar kosong (empty state
 * di halaman), bukan cabang contoh.
 *
 * Kolom cabang yang dibiarkan kosong diisi dari Kontak & Umum: nomor
 * WhatsApp, jam operasional, dan nomor telepon tampilan. Keduanya sama-sama
 * data admin, jadi ini bukan fallback statis — admin cukup mengisi sekali di
 * satu tempat bila semua cabang memakai nilai yang sama.
 */
import { cacheLife, cacheTag } from "next/cache";

import { sortBranches } from "@/lib/domain/branch";
import { directionsUrl, formatPhoneDisplay } from "@/lib/domain/site-settings";
import { safeQueryWithMeta } from "@/lib/safe-query";

import type { Branch, BranchRow } from "./branches.types";
import { getSiteSettings } from "./site";
import { CONTENT_TAGS } from "./tags";

export type { Branch } from "./branches.types";

async function readBranchRows(): Promise<{ data: BranchRow[]; usedFallback: boolean }> {
  "use cache";
  cacheTag(CONTENT_TAGS.branches);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.branch.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        name: true,
        area: true,
        tag: true,
        address: true,
        openingHours: true,
        whatsappNumber: true,
        phone: true,
        email: true,
        mapsEmbedUrl: true,
        mapsUrl: true,
        latitude: true,
        longitude: true,
        sortOrder: true,
      },
    });
    return sortBranches(rows);
  }, [] as BranchRow[]);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return { data, usedFallback };
}

/** Cabang yang ditampilkan di situs, urut sesuai pengaturan admin. */
export async function getBranches(): Promise<Branch[]> {
  const [{ data: rows }, settings] = await Promise.all([
    readBranchRows(),
    getSiteSettings(),
  ]);

  const fallbackPhone = formatPhoneDisplay(settings.whatsappNumber);

  return rows.map<Branch>((row) => {
    const address = row.address?.trim() ?? "";
    const whatsappNumber = row.whatsappNumber?.trim() || settings.whatsappNumber;
    const openingHours =
      row.openingHours.length > 0 ? row.openingHours : settings.openingHours;
    return {
      slug: row.slug,
      name: row.name,
      area: row.area,
      tag: row.tag,
      address,
      openingHours,
      phone: row.phone?.trim() || formatPhoneDisplay(whatsappNumber) || fallbackPhone,
      email: row.email?.trim() || "",
      whatsappNumber,
      mapsEmbedUrl: row.mapsEmbedUrl?.trim() ?? "",
      mapsUrl: row.mapsUrl?.trim() || (address ? directionsUrl(address) : ""),
      latitude: row.latitude,
      longitude: row.longitude,
    };
  });
}