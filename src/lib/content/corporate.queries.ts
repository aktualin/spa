/** Bacaan database konten /corporate — lihat `corporate.ts`. */
import {
  type CorporateClientItem,
  type CorporatePageContent,
  type CorporateProgramItem,
  type CorporateStepItem,
  emptyCorporateContent,
  resolveCorporateContent,
} from "@/lib/domain/corporate";
import { safeQueryWithMeta, type SafeQueryResult } from "@/lib/safe-query";

const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }, { id: "asc" as const }];

// Impor di dalam tiap query: kegagalan inisialisasi Prisma ikut tertangkap
// safeQuery dan halaman jatuh ke isi bawaan, bukan error.
const db = async () => (await import("@/lib/prisma")).prisma;

export function readCorporateContent(): Promise<SafeQueryResult<CorporatePageContent>> {
  return safeQueryWithMeta<CorporatePageContent>(async () => {
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
        heroImageUrl: true,
        heroImageAlt: true,
        aboutImageUrl: true,
        aboutImageAlt: true,
        inSpaImageUrl: true,
        inSpaImageAlt: true,
      },
    });
    return resolveCorporateContent(row);
  }, emptyCorporateContent());
}

export function readCorporatePrograms(): Promise<SafeQueryResult<CorporateProgramItem[]>> {
  return safeQueryWithMeta<CorporateProgramItem[]>(async () => {
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
  }, []);
}

export function readCorporateSteps(): Promise<SafeQueryResult<CorporateStepItem[]>> {
  return safeQueryWithMeta<CorporateStepItem[]>(async () => {
    const rows = await (await db()).corporateStep.findMany({ orderBy: ORDER });
    return rows.map((row) => ({ id: row.id, title: row.title, body: row.body ?? "" }));
  }, []);
}

export function readCorporateClients(): Promise<SafeQueryResult<CorporateClientItem[] | null>> {
  return safeQueryWithMeta<CorporateClientItem[] | null>(async () => {
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
  }, null);
}