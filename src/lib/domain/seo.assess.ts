/** Penilaian panjang teks SEO — lihat `seo.ts`. */
import { SEO_LIMITS } from "./seo.constants.ts";

export type SeoTextStatus = "empty" | "short" | "ideal" | "long";

export type SeoTextAssessment = {
  length: number;
  status: SeoTextStatus;
  message: string;
};

export function assessSeoText(
  value: string | null | undefined,
  kind: "title" | "description",
): SeoTextAssessment {
  const text = (value ?? "").trim();
  const length = [...text].length;
  const min = kind === "title" ? SEO_LIMITS.titleMin : SEO_LIMITS.descriptionMin;
  const max = kind === "title" ? SEO_LIMITS.titleMax : SEO_LIMITS.descriptionMax;
  const label = kind === "title" ? "Title" : "Description";

  if (length === 0) {
    return { length, status: "empty", message: `${label} kosong — memakai bawaan.` };
  }
  if (length > max) {
    return {
      length,
      status: "long",
      message: `${label} ${length} karakter — lebih dari ${max}, kemungkinan dipotong Google.`,
    };
  }
  if (length < min) {
    return {
      length,
      status: "short",
      message: `${label} ${length} karakter — agak pendek (ideal ${min}–${max}).`,
    };
  }
  return { length, status: "ideal", message: `${label} ${length} karakter — ideal.` };
}