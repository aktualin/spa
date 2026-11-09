/**
 * Bacaan publik Corporate Wellness untuk halaman `/corporate`.
 *
 * Yang dibaca HANYA konten: `CorporateContent` (singleton), `CorporateProgram`,
 * `CorporateStep`, dan `CorporateClient` yang tayang. `CorporateInquiry` berisi
 * data pribadi (UU PDP) dan TIDAK BOLEH diakses dari kode publik/cache publik.
 *
 * Tanpa fallback statis: tabel kosong atau database tidak terbaca → bagian
 * itu kosong dan halaman menyembunyikannya. Isi awalnya dipasang lewat
 * `scripts/seed.mts`, bukan ditanam di kode render.
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  type CollabPhoto,
  type CorporateClientItem,
  type CorporatePageContent,
  type CorporateProgramItem,
  type CorporateStepItem,
  collabPhotosFor,
  emptyCorporateContent,
  resolveCorporateContent,
} from "@/lib/domain/corporate";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type {
  CollabPhoto,
  CorporateClientItem,
  CorporatePageContent,
  CorporateProgramItem,
  CorporateStepItem,
};

export type CorporatePageData = {
  content: CorporatePageContent;
  programs: CorporateProgramItem[];
  steps: CorporateStepItem[];
  /** Klien tayang (logo/nama). Kosong bila belum ada klien. */
  clients: CorporateClientItem[];
  /** Foto dokumentasi "Past Collaborations". */
  collabPhotos: CollabPhoto[];
};

const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }, { id: "asc" as const }];

export async function getCorporatePageData(): Promise<CorporatePageData> {
  "use cache";
  cacheTag(CONTENT_TAGS.corporate);

  // Impor di dalam tiap query: kegagalan inisialisasi Prisma ikut tertangkap
  // safeQuery dan halaman jatuh ke isi bawaan, bukan error.
  const db = async () => (await import("@/lib/prisma")).prisma;

  const [content, programs, steps, clients] = await Promise.all([
    safeQueryWithMeta<CorporatePageContent>(async () => {
      const row = await (await db()).corporateContent.findUnique({
        where: { id: "singleton" },
        select: {
          heroTitle: true,
          intro: true,
          inOfficeHtml: true,
          inSpaHtml: true,
          stepsHtml: true,
          picName: true,
          picEmail: true,
          picPhone: true,
          benefits: true,
          solutions: true,
          inSpaItems: true,
        },
      });
      return resolveCorporateContent(row);
    }, emptyCorporateContent()),

    safeQueryWithMeta<CorporateProgramItem[]>(async () => {
      const rows = await (await db()).corporateProgram.findMany({ orderBy: ORDER });
      return rows
        .filter((row) => row.isPublished)
        .map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description ?? "",
          features: row.features ?? [],
          imageUrl: row.imageUrl,
        }));
    }, []),

    safeQueryWithMeta<CorporateStepItem[]>(async () => {
      const rows = await (await db()).corporateStep.findMany({ orderBy: ORDER });
      return rows.map((row) => ({ id: row.id, title: row.title, body: row.body ?? "" }));
    }, []),

    safeQueryWithMeta<CorporateClientItem[] | null>(async () => {
      const rows = await (await db()).corporateClient.findMany({ orderBy: ORDER });
      if (rows.length === 0) return null;
      return rows
        .filter((row) => row.isPublished)
        .map((row) => ({
          id: row.id,
          name: row.name,
          logoUrl: row.logoUrl,
          websiteUrl: row.websiteUrl,
          photoUrls: row.photoUrls ?? [],
        }));
    }, null),
  ]);

  const usedFallback =
    content.usedFallback || programs.usedFallback || steps.usedFallback || clients.usedFallback;
  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");

  return {
    content: content.data,
    programs: programs.data,
    steps: steps.data,
    clients: clients.data ?? [],
    collabPhotos: collabPhotosFor(clients.data),
  };
}
