/**
 * Aturan modul Corporate Wellness: isi bawaan halaman `/corporate` (sama
 * persis dengan desain lama), penggabungan data database + fallback statis,
 * validasi isian admin, urutan ↑/↓, anti-spam formulir inquiry, dan isi email
 * notifikasi ke pihak pertama.
 *
 * Modul murni (tanpa I/O, tanpa Next/Prisma) supaya bisa diuji langsung
 * dengan `node --test`.
 */
import { z } from "zod";

import {
  corporateBenefits,
  corporatePrograms,
  corporateSolutions,
} from "../../data/content.ts";
import { moveInList } from "./media.ts";

/* ------------------------------------------------------------------ */
/* Tipe data                                                           */
/* ------------------------------------------------------------------ */

export type CorporateSolution = { title: string; items: string[] };

export type CorporatePic = { name: string; email: string; phone: string };

/** Konten singleton halaman `/corporate` setelah digabung dengan fallback. */
export type CorporatePageContent = {
  heroTitle: string;
  intro: string;
  benefits: string[];
  solutions: CorporateSolution[];
  inSpaItems: string[];
  /** Deskripsi In-Spa (HTML). null → paragraf bawaan. */
  inSpaHtml: string | null;
  /** Catatan tambahan di bawah kartu program In-Office (HTML), opsional. */
  inOfficeHtml: string | null;
  /** Catatan tambahan di bawah langkah kolaborasi (HTML), opsional. */
  stepsHtml: string | null;
  pic: CorporatePic;
};

export type CorporateProgramItem = {
  id: string;
  name: string;
  description: string;
  features: string[];
  imageUrl: string | null;
};

export type CorporateStepItem = { id: string; title: string; body: string };

export type CorporateClientItem = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  photoUrls: string[];
};

export type CollabPhoto = { src: string; alt: string };

/** Baris `CorporateContent` (subset kolom yang dibaca). */
export type CorporateContentRow = {
  heroTitle: string;
  intro: string | null;
  inOfficeHtml: string | null;
  inSpaHtml: string | null;
  stepsHtml: string | null;
  picName: string | null;
  picEmail: string | null;
  picPhone: string | null;
  benefits: string[];
  solutions: unknown;
  inSpaItems: string[];
};

/* ------------------------------------------------------------------ */
/* Isi bawaan (desain asli /corporate)                                 */
/* ------------------------------------------------------------------ */

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

export const STATIC_COLLAB_ALT = "KAMA corporate wellness collaboration";

export const STATIC_COLLAB_PHOTOS: readonly string[] = [
  "/img/kama/corporate/06-collab-1.jpg",
  "/img/kama/corporate/07-collab-2.jpg",
  "/img/kama/corporate/08-collab-3.jpg",
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

export function staticCollabPhotos(): CollabPhoto[] {
  return STATIC_COLLAB_PHOTOS.map((src) => ({ src, alt: STATIC_COLLAB_ALT }));
}

/* ------------------------------------------------------------------ */
/* Penggabungan database + fallback                                    */
/* ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** true bila HTML memuat teks yang terlihat (bukan sekadar tag kosong). */
export function hasVisibleText(html: string | null | undefined): boolean {
  if (!html) return false;
  const text = html
    .replace(/<img\b[^>]*>/gi, "x")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ");
  return /\S/.test(text);
}

/** Kolom JSON `solutions` → daftar blok; entri rusak dibuang. */
export function readSolutions(value: unknown): CorporateSolution[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.title !== "string" || !item.title.trim()) return [];
    const items = Array.isArray(item.items)
      ? item.items.filter((v): v is string => typeof v === "string" && v.trim() !== "")
      : [];
    return [{ title: item.title, items }];
  });
}

/**
 * Konten halaman dari baris database. Kolom yang belum diisi (null / daftar
 * kosong) memakai isi bawaan, sehingga tampilan tidak berubah sampai admin
 * benar-benar mengisinya.
 */
/** Konten kosong: belum disimpan admin → halaman menyembunyikan bagiannya. */
export function emptyCorporateContent(): CorporatePageContent {
  return {
    heroTitle: "",
    intro: "",
    benefits: [],
    solutions: [],
    inSpaItems: [],
    inSpaHtml: null,
    inOfficeHtml: null,
    stepsHtml: null,
    pic: { name: "", email: "", phone: "" },
  };
}

/**
 * Baris `CorporateContent` → isi halaman. Tanpa fallback statis: kolom yang
 * belum diisi admin tetap kosong dan halaman menyembunyikan bagian itu.
 */
export function resolveCorporateContent(row: CorporateContentRow | null): CorporatePageContent {
  if (!row) return emptyCorporateContent();

  return {
    heroTitle: nonEmpty(row.heroTitle) ?? "",
    intro: nonEmpty(row.intro) ?? "",
    benefits: (row.benefits ?? []).filter((b) => b.trim() !== ""),
    solutions: readSolutions(row.solutions),
    inSpaItems: (row.inSpaItems ?? []).filter((b) => b.trim() !== ""),
    inSpaHtml: hasVisibleText(row.inSpaHtml) ? row.inSpaHtml : null,
    inOfficeHtml: hasVisibleText(row.inOfficeHtml) ? row.inOfficeHtml : null,
    stepsHtml: hasVisibleText(row.stepsHtml) ? row.stepsHtml : null,
    pic: {
      name: nonEmpty(row.picName) ?? "",
      email: nonEmpty(row.picEmail) ?? "",
      phone: nonEmpty(row.picPhone) ?? "",
    },
  };
}

/**
 * Foto "Past Collaborations" dari dokumentasi klien yang tayang, berurutan.
 * Belum ada klien → daftar kosong dan bagiannya disembunyikan.
 */
export function collabPhotosFor(
  clients: readonly CorporateClientItem[] | null,
): CollabPhoto[] {
  if (clients === null) return [];
  return clients.flatMap((client) =>
    client.photoUrls.map((src) => ({
      src,
      alt: `${client.name} — ${STATIC_COLLAB_ALT}`,
    })),
  );
}

/* ------------------------------------------------------------------ */
/* Validasi isian admin                                                */
/* ------------------------------------------------------------------ */

export const CORPORATE_LIMITS = {
  heroTitle: 200,
  intro: 1000,
  listItem: 200,
  maxBenefits: 20,
  maxSolutions: 6,
  maxSolutionItems: 12,
  maxInSpaItems: 20,
  picName: 80,
  picPhone: 30,
  programName: 80,
  programDescription: 1000,
  maxFeatures: 15,
  stepTitle: 120,
  stepBody: 500,
  clientName: 120,
  websiteUrl: 300,
  maxClientPhotos: 30,
} as const;

export type Validation<T> = { ok: true; data: T } | { ok: false; error: string };

/** Rapikan daftar dari form: trim, buang kosong & kembar, urutan dipertahankan. */
export function cleanList(values: readonly unknown[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const item = value.replace(/\s+/g, " ").trim();
    if (item && !out.includes(item)) out.push(item);
  }
  return out;
}

function checkList(
  items: string[],
  label: string,
  max: number,
): string | null {
  if (items.length > max) return `Maksimal ${max} ${label}.`;
  const tooLong = items.find((item) => item.length > CORPORATE_LIMITS.listItem);
  if (tooLong) {
    return `Setiap ${label} maksimal ${CORPORATE_LIMITS.listItem} karakter.`;
  }
  return null;
}

/**
 * Blok "solutions" dari form: judul per blok + isi per blok (satu item per
 * baris). Blok tanpa judul dan tanpa isi diabaikan; blok berisi tanpa judul
 * ditolak.
 */
export function parseSolutionsInput(
  titles: readonly string[],
  itemsText: readonly string[],
): Validation<CorporateSolution[]> {
  const solutions: CorporateSolution[] = [];
  const count = Math.max(titles.length, itemsText.length);
  for (let i = 0; i < count; i += 1) {
    const title = (titles[i] ?? "").replace(/\s+/g, " ").trim();
    const items = cleanList((itemsText[i] ?? "").split(/\r?\n/));
    if (!title && items.length === 0) continue;
    if (!title) return { ok: false, error: `Blok solusi ke-${i + 1} belum punya judul.` };
    if (title.length > CORPORATE_LIMITS.listItem) {
      return { ok: false, error: `Judul blok solusi maksimal ${CORPORATE_LIMITS.listItem} karakter.` };
    }
    const listError = checkList(items, "poin per blok solusi", CORPORATE_LIMITS.maxSolutionItems);
    if (listError) return { ok: false, error: listError };
    solutions.push({ title, items });
  }
  if (solutions.length > CORPORATE_LIMITS.maxSolutions) {
    return { ok: false, error: `Maksimal ${CORPORATE_LIMITS.maxSolutions} blok solusi.` };
  }
  return { ok: true, data: solutions };
}

export type ContentInput = {
  heroTitle: string;
  intro: string;
  benefits: readonly string[];
  solutionTitles: readonly string[];
  solutionItems: readonly string[];
  inSpaItems: readonly string[];
};

export type ContentData = {
  heroTitle: string;
  intro: string | null;
  benefits: string[];
  solutions: CorporateSolution[];
  inSpaItems: string[];
};

export function validateContentInput(input: ContentInput): Validation<ContentData> {
  const heroTitle = input.heroTitle.trim();
  if (!heroTitle) return { ok: false, error: "Judul hero wajib diisi." };
  if (heroTitle.length > CORPORATE_LIMITS.heroTitle) {
    return { ok: false, error: `Judul hero maksimal ${CORPORATE_LIMITS.heroTitle} karakter.` };
  }
  const intro = input.intro.trim();
  if (intro.length > CORPORATE_LIMITS.intro) {
    return { ok: false, error: `Intro maksimal ${CORPORATE_LIMITS.intro} karakter.` };
  }

  const benefits = cleanList(input.benefits);
  const benefitError = checkList(benefits, "benefit", CORPORATE_LIMITS.maxBenefits);
  if (benefitError) return { ok: false, error: benefitError };

  const inSpaItems = cleanList(input.inSpaItems);
  const inSpaError = checkList(inSpaItems, "item In-Spa", CORPORATE_LIMITS.maxInSpaItems);
  if (inSpaError) return { ok: false, error: inSpaError };

  const solutions = parseSolutionsInput(input.solutionTitles, input.solutionItems);
  if (!solutions.ok) return solutions;

  return {
    ok: true,
    data: { heroTitle, intro: intro || null, benefits, solutions: solutions.data, inSpaItems },
  };
}

/**
 * HTML opsional dari editor: tanpa teks terlihat → null; sama dengan isi
 * bawaan → null (supaya halaman tetap memakai markup asli).
 */
export function optionalHtml(html: string, defaultHtml?: string): string | null {
  if (!hasVisibleText(html)) return null;
  const normalize = (value: string) => value.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  if (defaultHtml && normalize(html) === normalize(defaultHtml)) return null;
  return html;
}

const emailSchema = z.string().email();

export function isEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

/**
 * Nomor telepon PIC: hanya digit, spasi, "+", "-", ".", dan kurung; 8–15
 * digit. Nomor Indonesia (0…, 62…, +62…) dipakai juga untuk tautan WhatsApp.
 */
export function isPhone(value: string): boolean {
  if (!/^\+?[\d\s().-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function validatePicInput(input: {
  name: string;
  email: string;
  phone: string;
}): Validation<CorporatePic> {
  const name = input.name.replace(/\s+/g, " ").trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  if (!name) return { ok: false, error: "Nama PIC wajib diisi." };
  if (name.length > CORPORATE_LIMITS.picName) {
    return { ok: false, error: `Nama PIC maksimal ${CORPORATE_LIMITS.picName} karakter.` };
  }
  if (!email) return { ok: false, error: "Email PIC wajib diisi." };
  if (!isEmail(email)) return { ok: false, error: "Format email PIC tidak valid." };
  if (!phone) return { ok: false, error: "Telepon PIC wajib diisi." };
  if (phone.length > CORPORATE_LIMITS.picPhone || !isPhone(phone)) {
    return {
      ok: false,
      error: "Nomor telepon PIC tidak valid. Gunakan 8–15 digit, mis. +62 813-1485-6565.",
    };
  }
  return { ok: true, data: { name, email, phone } };
}

export type ProgramData = {
  name: string;
  description: string | null;
  features: string[];
  imageUrl: string | null;
  isPublished: boolean;
};

/** URL gambar dari ImageField: http(s) atau path lokal "/…". Kosong → null. */
export function readImageUrl(value: string): Validation<string | null> {
  const url = value.trim();
  if (!url) return { ok: true, data: null };
  if (/^https?:\/\/\S+$/.test(url) || /^\/[^/\s]\S*$/.test(url)) return { ok: true, data: url };
  return { ok: false, error: "URL gambar tidak valid." };
}

export function validateProgramInput(input: {
  name: string;
  description: string;
  features: readonly string[];
  imageUrl: string;
  isPublished: boolean;
}): Validation<ProgramData> {
  const name = input.name.replace(/\s+/g, " ").trim();
  if (!name) return { ok: false, error: "Nama program wajib diisi." };
  if (name.length > CORPORATE_LIMITS.programName) {
    return { ok: false, error: `Nama program maksimal ${CORPORATE_LIMITS.programName} karakter.` };
  }
  const description = input.description.trim();
  if (description.length > CORPORATE_LIMITS.programDescription) {
    return {
      ok: false,
      error: `Deskripsi maksimal ${CORPORATE_LIMITS.programDescription} karakter.`,
    };
  }
  const features = cleanList(input.features);
  const featureError = checkList(features, "fitur", CORPORATE_LIMITS.maxFeatures);
  if (featureError) return { ok: false, error: featureError };
  const image = readImageUrl(input.imageUrl);
  if (!image.ok) return image;

  return {
    ok: true,
    data: {
      name,
      description: description || null,
      features,
      imageUrl: image.data,
      isPublished: input.isPublished,
    },
  };
}

export function validateStepInput(input: {
  title: string;
  body: string;
}): Validation<{ title: string; body: string | null }> {
  const title = input.title.replace(/\s+/g, " ").trim();
  const body = input.body.trim();
  if (!title) return { ok: false, error: "Judul langkah wajib diisi." };
  if (title.length > CORPORATE_LIMITS.stepTitle) {
    return { ok: false, error: `Judul langkah maksimal ${CORPORATE_LIMITS.stepTitle} karakter.` };
  }
  if (body.length > CORPORATE_LIMITS.stepBody) {
    return { ok: false, error: `Keterangan langkah maksimal ${CORPORATE_LIMITS.stepBody} karakter.` };
  }
  return { ok: true, data: { title, body: body || null } };
}

/**
 * Website klien: boleh tanpa "https://" (ditambahkan otomatis). Hanya http(s).
 */
export function normalizeWebsiteUrl(value: string): Validation<string | null> {
  const raw = value.trim();
  if (!raw) return { ok: true, data: null };
  if (raw.length > CORPORATE_LIMITS.websiteUrl) {
    return { ok: false, error: "Alamat website terlalu panjang." };
  }
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { ok: false, error: "Website harus diawali http:// atau https://." };
    }
    if (!url.hostname.includes(".")) {
      return { ok: false, error: "Alamat website tidak valid." };
    }
    return { ok: true, data: url.toString() };
  } catch {
    return { ok: false, error: "Alamat website tidak valid." };
  }
}

export type ClientData = {
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  photoUrls: string[];
  isPublished: boolean;
};

export function validateClientInput(input: {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  photoUrls: readonly unknown[];
  isPublished: boolean;
}): Validation<ClientData> {
  const name = input.name.replace(/\s+/g, " ").trim();
  if (!name) return { ok: false, error: "Nama klien wajib diisi." };
  if (name.length > CORPORATE_LIMITS.clientName) {
    return { ok: false, error: `Nama klien maksimal ${CORPORATE_LIMITS.clientName} karakter.` };
  }
  const logo = readImageUrl(input.logoUrl);
  if (!logo.ok) return { ok: false, error: "URL logo tidak valid." };
  const website = normalizeWebsiteUrl(input.websiteUrl);
  if (!website.ok) return website;

  const photoUrls: string[] = [];
  for (const value of input.photoUrls) {
    if (typeof value !== "string" || !value.trim()) continue;
    const photo = readImageUrl(value);
    if (!photo.ok || !photo.data) return { ok: false, error: "Ada URL foto dokumentasi yang tidak valid." };
    if (!photoUrls.includes(photo.data)) photoUrls.push(photo.data);
  }
  if (photoUrls.length > CORPORATE_LIMITS.maxClientPhotos) {
    return {
      ok: false,
      error: `Maksimal ${CORPORATE_LIMITS.maxClientPhotos} foto dokumentasi per klien.`,
    };
  }

  return {
    ok: true,
    data: {
      name,
      logoUrl: logo.data,
      websiteUrl: website.data,
      photoUrls,
      isPublished: input.isPublished,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Urutan ↑/↓                                                          */
/* ------------------------------------------------------------------ */

export type SortRow = { id: string; sortOrder: number };

/**
 * Pindahkan satu baris ke atas/bawah. `rows` harus sudah terurut seperti yang
 * tampil. Hasil: hanya baris yang `sortOrder`-nya berubah (urutan dirapatkan
 * menjadi 0..n-1).
 */
export function reorderUpdates(
  rows: readonly SortRow[],
  id: string,
  direction: "up" | "down",
): SortRow[] {
  const current = new Map(rows.map((row) => [row.id, row.sortOrder]));
  if (!current.has(id)) return [];
  const ordered = moveInList(
    rows.map((row) => row.id),
    id,
    direction,
  );
  return ordered
    .map((rowId, index) => ({ id: rowId, sortOrder: index }))
    .filter((row) => current.get(row.id) !== row.sortOrder);
}

/** `sortOrder` untuk item baru di akhir daftar. */
export function nextSortOrder(max: number | null | undefined): number {
  return typeof max === "number" && Number.isFinite(max) ? max + 1 : 0;
}

export function readDirection(value: unknown): "up" | "down" | null {
  return value === "up" || value === "down" ? value : null;
}

/* ------------------------------------------------------------------ */
/* Anti-spam formulir inquiry                                          */
/* ------------------------------------------------------------------ */

/** Waktu minimal (ms) sejak formulir tampil sampai dikirim. */
export const MIN_INQUIRY_FILL_MS = 3000;

/** Batas ukuran body permintaan inquiry (byte/karakter). */
export const MAX_INQUIRY_BODY = 20_000;

/**
 * Cek lama pengisian. `elapsedMs` dihitung browser dari jam browser sendiri
 * (bebas selisih jam server ↔ klien).
 * - "missing"  → tidak dikirim / bukan angka: bukan dari formulir kita (bot).
 * - "too-fast" → dikirim kurang dari batas minimum.
 */
export function checkFillTime(
  elapsedMs: unknown,
  minMs: number = MIN_INQUIRY_FILL_MS,
): "ok" | "missing" | "too-fast" {
  if (typeof elapsedMs !== "number" || !Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return "missing";
  }
  return elapsedMs < minMs ? "too-fast" : "ok";
}

/**
 * Kebijakan captcha:
 * - secret ada → "verify" (token wajib & diverifikasi ke Turnstile);
 * - secret kosong di production → "unavailable" (fail-closed, kiriman ditolak);
 * - secret kosong di luar production → "skip" (development, dengan peringatan).
 */
export function resolveCaptchaPolicy(input: {
  secret: string | undefined | null;
  nodeEnv: string | undefined;
}): "verify" | "skip" | "unavailable" {
  if (input.secret && input.secret.trim()) return "verify";
  return input.nodeEnv === "production" ? "unavailable" : "skip";
}

/**
 * Penerima email notifikasi: `CORPORATE_INQUIRY_TO` (boleh beberapa alamat,
 * dipisah koma) → email PIC. Alamat tidak valid dibuang.
 */
export function resolveInquiryRecipients(input: {
  envTo: string | undefined | null;
  picEmail: string | undefined | null;
}): string[] {
  const fromEnv = cleanList((input.envTo ?? "").split(/[,;]/)).filter(isEmail);
  if (fromEnv.length > 0) return fromEnv;
  const pic = input.picEmail?.trim();
  return pic && isEmail(pic) ? [pic] : [];
}

/* ------------------------------------------------------------------ */
/* Email notifikasi                                                    */
/* ------------------------------------------------------------------ */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Satu baris tanpa karakter kontrol (untuk subjek email). */
function singleLine(value: string, max = 80): string {
  const line = value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}

export type InquiryEmailInput = {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string;
  /** Tautan ke detail inquiry di dashboard admin. */
  adminUrl: string;
};

export function buildInquiryEmail(input: InquiryEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const who = input.company ? `${input.name} (${input.company})` : input.name;
  const subject = `Inquiry Corporate Wellness baru — ${singleLine(who)}`;

  const rows: [string, string][] = [
    ["Nama", input.name],
    ...(input.company ? ([["Perusahaan", input.company]] as [string, string][]) : []),
    ["Email", input.email],
    ...(input.phone ? ([["Telepon", input.phone]] as [string, string][]) : []),
  ];

  const text = [
    "Inquiry Corporate Wellness baru dari situs KAMA Spa.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Pesan:",
    input.message,
    "",
    `Kelola di dashboard: ${input.adminUrl}`,
    "",
    "Email ini memuat data pribadi (UU PDP). Jangan diteruskan ke luar tim.",
  ].join("\n");

  const html = [
    "<p><strong>Inquiry Corporate Wellness baru</strong> dari situs KAMA Spa.</p>",
    "<table cellpadding=\"4\" style=\"border-collapse:collapse\">",
    ...rows.map(
      ([label, value]) =>
        `<tr><td style="color:#666">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
    ),
    "</table>",
    "<p><strong>Pesan:</strong></p>",
    `<p>${escapeHtml(input.message).replace(/\r?\n/g, "<br />")}</p>`,
    `<p><a href="${escapeHtml(input.adminUrl)}">Buka di dashboard admin</a></p>`,
    "<p style=\"color:#888;font-size:12px\">Email ini memuat data pribadi (UU PDP). Jangan diteruskan ke luar tim.</p>",
  ].join("");

  return { subject, text, html };
}
