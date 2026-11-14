import { MAX_PAGE_SLUG_LENGTH } from "@/lib/domain/page-url";
import { slugify } from "@/lib/domain/slug";

import type { ActionState } from "../actions/pages";

export type PageTemplateValue = "STANDARD" | "LEGAL";
export type PageStatusValue = "DRAFT" | "PUBLISHED";

export type PageFormData = {
  id: string | null;
  title: string;
  slug: string;
  template: PageTemplateValue;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
  status: PageStatusValue;
  /** true bila halaman pernah terbit — perubahan slug akan membuat redirect 301. */
  wasPublished: boolean;
};

export const TEMPLATES: { value: PageTemplateValue; label: string; description: string }[] = [
  {
    value: "STANDARD",
    label: "Standar",
    description: "Judul dan isi teks berformat. Cocok untuk halaman informasi umum.",
  },
  {
    value: "LEGAL",
    label: "Dokumen legal",
    description:
      "Tata letak dokumen panjang seperti Kebijakan Privasi atau Syarat & Ketentuan.",
  },
];

export const STATUSES: { value: PageStatusValue; label: string }[] = [
  { value: "DRAFT", label: "Draf — belum tampil di website" },
  { value: "PUBLISHED", label: "Terbit — tampil di website" },
];

export const initialState: ActionState = { error: null };

export function autoSlug(title: string): string {
  return slugify(title).slice(0, MAX_PAGE_SLUG_LENGTH).replace(/-+$/, "");
}