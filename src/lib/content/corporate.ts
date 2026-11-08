/**
 * Bacaan publik Corporate Wellness.
 *
 * HANYA `CorporateContent` (singleton) yang dibaca. `CorporateInquiry` berisi
 * PII dan tidak boleh diakses dari kode publik.
 *
 * Fallback: data statis `corporateBenefits/Solutions/Programs` dari
 * `src/data/content.ts`.
 */
import { cacheLife, cacheTag } from "next/cache";

import {
  corporateBenefits,
  corporatePrograms,
  corporateSolutions,
} from "@/data/content";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type CorporateSolution = {
  title: string;
  items: string[];
};

export type CorporateProgram = {
  name: string;
  description: string;
  features: string[];
};

export type CorporateContentData = {
  heroTitle: string;
  intro: string | null;
  inOfficeHtml: string | null;
  inSpaHtml: string | null;
  stepsHtml: string | null;
  picName: string | null;
  picEmail: string | null;
  picPhone: string | null;
  benefits: string[];
  solutions: CorporateSolution[];
  programs: CorporateProgram[];
};

/** Dilengkapi dari corporateSolutions/corporatePrograms statis. */
const STATIC_IN_SPA_ITEMS = [
  "Private Group Experiences",
  "Employee Rewards",
  "Appreciation Events",
  "Team Wellness Days",
  "Leadership Retreats",
  "Company Celebrations",
];

const STATIC_STEPS: { title: string; body: string }[] = [
  { title: "Discovery & Consultation", body: "Understand your goals" },
  {
    title: "Tailored Proposal",
    body: "Program and benefits designed for your company",
  },
  {
    title: "Program Activation",
    body: "Coordinated and delivered by KAMA",
  },
  {
    title: "Review & Optimization",
    body: "Tracking feedback and improving future programs",
  },
];

function staticContent(): CorporateContentData {
  return {
    heroTitle:
      "Empowering healthier teams through meaningful wellness experiences.",
    intro:
      "Employee wellness is no longer just a benefit—it has become an essential investment in building a healthier, happier, and more productive workplace.",
    inOfficeHtml: null,
    inSpaHtml: null,
    stepsHtml: null,
    picName: null,
    picEmail: null,
    picPhone: null,
    benefits: corporateBenefits,
    solutions: corporateSolutions.map((s) => ({ title: s.title, items: s.items })),
    programs: corporatePrograms.map((p) => ({
      name: p.name,
      description: p.description,
      features: p.features,
    })),
  };
}

/** Konten corporate wellness (program in-office, in-spa, steps, PIC). */
export async function getCorporateContent(): Promise<CorporateContentData> {
  "use cache";
  cacheTag(CONTENT_TAGS.corporate);

  const { data, usedFallback } = await safeQueryWithMeta<CorporateContentData>(
    async () => {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.corporateContent.findUnique({
        where: { id: "singleton" },
      });
      if (!row) throw new Error("konten corporate kosong");
      const fallback = staticContent();
      return {
        heroTitle: row.heroTitle,
        intro: row.intro ?? fallback.intro,
        inOfficeHtml: row.inOfficeHtml,
        inSpaHtml: row.inSpaHtml,
        stepsHtml: row.stepsHtml,
        picName: row.picName,
        picEmail: row.picEmail,
        picPhone: row.picPhone,
        benefits: fallback.benefits,
        solutions: fallback.solutions,
        programs: fallback.programs,
      };
    },
    staticContent(),
  );

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Item "Ideal For" In-Spa — dipakai bila DB belum punya `inSpaHtml`. */
export function getCorporateInSpaItems(): string[] {
  return STATIC_IN_SPA_ITEMS;
}

/** Langkah kolaborasi — dipakai bila DB belum punya `stepsHtml`. */
export function getCorporateSteps(): { title: string; body: string }[] {
  return STATIC_STEPS;
}
