import type { ActionState } from "../actions/treatments";

export type OptionRow = { label: string; durationMin: string; priceIdr: string };

export type TreatmentCategoryOption = {
  id: string;
  name: string;
  kind: "TREATMENT" | "ADDON";
};

export const ADDON_SECTIONS = [
  { value: "BODY", label: "Body — grid scrub & mask" },
  { value: "FACE", label: "Face Ritual — section tersendiri" },
  { value: "HEAD_SCALP", label: "Head & Scalp — section tersendiri" },
  { value: "BATH", label: "Bath Ritual — section tersendiri" },
] as const;

export type TreatmentFormData = {
  id: string | null;
  name: string;
  slug: string;
  categoryId: string;
  tagline: string;
  description: string;
  note: string;
  addonSection: string;
  imageUrl: string;
  whatsappMessage: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  isNew: boolean;
  isBestSeller: boolean;
  isPublished: boolean;
  options: OptionRow[];
  contentImages: { imageUrl: string; altText: string | null }[];
};

export const initialState: ActionState = { error: null };