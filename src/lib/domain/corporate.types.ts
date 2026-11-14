/** Tipe data modul Corporate Wellness — lihat `corporate.ts`. */

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
  /** Foto hero, About, dan In-Spa dari admin; null → bagian tanpa gambar. */
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  aboutImageUrl: string | null;
  aboutImageAlt: string | null;
  inSpaImageUrl: string | null;
  inSpaImageAlt: string | null;
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
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  aboutImageUrl: string | null;
  aboutImageAlt: string | null;
  inSpaImageUrl: string | null;
  inSpaImageAlt: string | null;
};