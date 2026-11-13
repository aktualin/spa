/**
 * Aturan program membership (`MembershipProgram`): nilai bawaan dari konten
 * statis lama, pembacaan kolom JSON yang aman, dan validasi isian admin.
 * Modul murni — diuji langsung dengan `node --test`.
 */
import { membership as homeMembership } from "../../data/content.ts";
import { membership as pageMembership } from "../../data/pages.ts";
import { richTextLength } from "./rich-text.ts";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Kolom JSON `benefits` → daftar benefit; entri rusak dibuang. */
export function readBenefits(value: unknown): ProgramBenefit[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) =>
    isRecord(item) && typeof item.title === "string" && item.title.trim()
      ? [{ title: item.title, body: typeof item.body === "string" ? item.body : "" }]
      : [],
  );
}

/** Kolom JSON `services` → daftar layanan; entri rusak dibuang. */
export function readServices(value: unknown): ProgramService[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) =>
    isRecord(item) && typeof item.name === "string" && item.name.trim()
      ? [
          {
            name: item.name,
            description: typeof item.description === "string" ? item.description : "",
          },
        ]
      : [],
  );
}

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

type Result =
  | { ok: true; data: Omit<MembershipProgramData, "termsHtml"> }
  | { ok: false; error: string };

/**
 * Pasangkan dua kolom baris (judul + isi). Baris kosong dua-duanya dibuang;
 * baris yang hanya terisi isinya ditolak (judul wajib).
 */
function pairRows(
  titles: string[],
  bodies: string[],
  what: string,
): { ok: true; rows: [string, string][] } | { ok: false; error: string } {
  const rows: [string, string][] = [];
  const count = Math.max(titles.length, bodies.length);
  for (let i = 0; i < count; i += 1) {
    const title = (titles[i] ?? "").trim();
    const body = (bodies[i] ?? "").trim();
    if (!title && !body) continue;
    if (!title) return { ok: false, error: `${what} baris ${i + 1}: judul wajib diisi.` };
    if (title.length > PROGRAM_LIMITS.itemTitle) {
      return { ok: false, error: `${what} baris ${i + 1}: judul maksimal ${PROGRAM_LIMITS.itemTitle} karakter.` };
    }
    if (body.length > PROGRAM_LIMITS.itemBody) {
      return { ok: false, error: `${what} baris ${i + 1}: keterangan maksimal ${PROGRAM_LIMITS.itemBody} karakter.` };
    }
    rows.push([title, body]);
  }
  return { ok: true, rows };
}

const TEXT_FIELDS: { key: keyof ProgramInput & keyof typeof PROGRAM_LIMITS; label: string }[] = [
  { key: "eyebrow", label: "Eyebrow" },
  { key: "title", label: "Judul" },
  { key: "intro", label: "Intro" },
  { key: "priceHeadline", label: "Kalimat harga" },
  { key: "bannerBody", label: "Deskripsi banner homepage" },
  { key: "servicesIntro", label: "Intro essential services" },
];

export function validateProgramInput(input: ProgramInput): Result {
  const text: Record<string, string> = {};
  for (const { key, label } of TEXT_FIELDS) {
    const value = String(input[key] ?? "").trim();
    if (!value) return { ok: false, error: `${label} wajib diisi.` };
    const max = PROGRAM_LIMITS[key];
    // Field berformat (intro) dihitung dari teks terlihat, bukan markup HTML.
    if (richTextLength(value) === 0) return { ok: false, error: `${label} wajib diisi.` };
    if (richTextLength(value) > max) {
      return { ok: false, error: `${label} maksimal ${max} karakter.` };
    }
    text[key] = value;
  }

  const benefits = pairRows(input.benefitTitles, input.benefitBodies, "Benefit");
  if (!benefits.ok) return benefits;
  if (benefits.rows.length === 0) return { ok: false, error: "Isi minimal satu benefit." };
  if (benefits.rows.length > PROGRAM_LIMITS.maxBenefits) {
    return { ok: false, error: `Maksimal ${PROGRAM_LIMITS.maxBenefits} benefit.` };
  }

  const services = pairRows(input.serviceNames, input.serviceDescriptions, "Essential service");
  if (!services.ok) return services;
  if (services.rows.length > PROGRAM_LIMITS.maxServices) {
    return { ok: false, error: `Maksimal ${PROGRAM_LIMITS.maxServices} essential service.` };
  }

  return {
    ok: true,
    data: {
      eyebrow: text.eyebrow,
      title: text.title,
      intro: text.intro,
      priceHeadline: text.priceHeadline,
      bannerBody: text.bannerBody,
      servicesIntro: text.servicesIntro,
      benefits: benefits.rows.map(([title, body]) => ({ title, body })),
      services: services.rows.map(([name, description]) => ({ name, description })),
    },
  };
}
