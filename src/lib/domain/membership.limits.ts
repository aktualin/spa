/** Batas & tipe isian program membership — lihat `membership.ts`. */
import type { MembershipProgramData } from "./membership.types.ts";

export const PROGRAM_LIMITS = {
  eyebrow: 40,
  title: 200,
  intro: 600,
  priceHeadline: 80,
  bannerBody: 300,
  servicesIntro: 300,
  itemTitle: 100,
  itemBody: 400,
  maxBenefits: 12,
  maxServices: 20,
} as const;

export type ProgramInput = {
  eyebrow: string;
  title: string;
  intro: string;
  priceHeadline: string;
  bannerBody: string;
  servicesIntro: string;
  benefitTitles: string[];
  benefitBodies: string[];
  serviceNames: string[];
  serviceDescriptions: string[];
};

export type Result =
  | { ok: true; data: Omit<MembershipProgramData, "termsHtml"> }
  | { ok: false; error: string };