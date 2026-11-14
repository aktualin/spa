/** Tipe & isi bawaan program membership — lihat `membership.ts`. */
import { membership as homeMembership } from "../../data/content.ts";
import { membership as pageMembership } from "../../data/pages.ts";

export type ProgramBenefit = { title: string; body: string };
export type ProgramService = { name: string; description: string };

export type MembershipProgramData = {
  eyebrow: string;
  title: string;
  intro: string;
  priceHeadline: string;
  bannerBody: string;
  benefits: ProgramBenefit[];
  servicesIntro: string;
  services: ProgramService[];
  termsHtml: string | null;
};

/** Isi program sebelum admin pernah menyimpan — sama dengan situs lama. */
export function staticMembershipProgram(): MembershipProgramData {
  return {
    eyebrow: pageMembership.eyebrow,
    title: pageMembership.title,
    intro: pageMembership.intro,
    priceHeadline: pageMembership.price,
    bannerBody: homeMembership.body,
    benefits: pageMembership.benefits.map((b) => ({ title: b.title, body: b.body })),
    servicesIntro: pageMembership.servicesIntro,
    services: pageMembership.services.map((s) => ({
      name: s.name,
      description: s.description,
    })),
    termsHtml: null,
  };
}