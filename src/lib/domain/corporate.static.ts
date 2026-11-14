/** Isi bawaan halaman /corporate (desain asli) — lihat `corporate.ts`. */
import {
  corporateBenefits,
  corporatePrograms,
  corporateSolutions,
} from "../../data/content.ts";
import type {
  CorporatePageContent,
  CorporatePic,
  CorporateProgramItem,
  CorporateStepItem,
} from "./corporate.types.ts";

export const STATIC_HERO_TITLE =
  "Empowering healthier teams through meaningful wellness experiences.";

export const STATIC_INTRO =
  "Employee wellness is no longer just a benefit—it has become an essential investment in building a healthier, happier, and more productive workplace.";

export const STATIC_IN_SPA_DESCRIPTION =
  "Treat your employees to a private wellness experience at KAMA Spa—designed to reward, reconnect, and recharge your team in a calm and premium environment.";

/** Bentuk HTML deskripsi In-Spa bawaan — dipakai untuk mengisi form admin. */
export const STATIC_IN_SPA_HTML = `<p>${STATIC_IN_SPA_DESCRIPTION}</p>`;

export const STATIC_IN_SPA_ITEMS: readonly string[] = [
  "Private Group Experiences",
  "Employee Rewards",
  "Appreciation Events",
  "Team Wellness Days",
  "Leadership Retreats",
  "Company Celebrations",
];

export const STATIC_STEPS: readonly { title: string; body: string }[] = [
  { title: "Discovery & Consultation", body: "Understand your goals" },
  { title: "Tailored Proposal", body: "Program and benefits designed for your company" },
  { title: "Program Activation", body: "Coordinated and delivered by KAMA" },
  { title: "Review & Optimization", body: "Tracking feedback and improving future programs" },
];

/** Kontak PIC di banner "Let's build your wellness program." */
export const STATIC_PIC: CorporatePic = {
  name: "Roy",
  email: "marketing@kamaspa.id",
  phone: "+62 813-1485-6565",
};

/**
 * Isi awal untuk SEED dan form admin — bukan untuk dirender ke pengunjung.
 * Jalur render membaca database saja; tabel kosong → bagian itu disembunyikan.
 */
export function staticCorporateContent(): CorporatePageContent {
  return {
    heroTitle: STATIC_HERO_TITLE,
    intro: STATIC_INTRO,
    benefits: [...corporateBenefits],
    solutions: corporateSolutions.map((s) => ({ title: s.title, items: [...s.items] })),
    inSpaItems: [...STATIC_IN_SPA_ITEMS],
    inSpaHtml: null,
    inOfficeHtml: null,
    stepsHtml: null,
    pic: { ...STATIC_PIC },
    heroImageUrl: null,
    heroImageAlt: null,
    aboutImageUrl: null,
    aboutImageAlt: null,
    inSpaImageUrl: null,
    inSpaImageAlt: null,
  };
}

export function staticCorporatePrograms(): CorporateProgramItem[] {
  return corporatePrograms.map((p, index) => ({
    id: `static-${index}`,
    name: p.name,
    description: p.description,
    features: [...p.features],
    imageUrl: null,
  }));
}

export function staticCorporateSteps(): CorporateStepItem[] {
  return STATIC_STEPS.map((s, index) => ({ id: `static-${index}`, ...s }));
}