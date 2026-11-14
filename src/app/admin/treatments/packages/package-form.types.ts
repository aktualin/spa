import type { ActionState } from "../../actions/packages";

export type PackageItemRow = {
  treatmentId: string;
  label: string;
  minutes: string;
};

export type PackageFormData = {
  id: string | null;
  name: string;
  slug: string;
  subtitle: string;
  quote: string;
  description: string;
  imageUrl: string;
  priceIdr: string;
  durationMin: string;
  durationLabel: string;
  sortOrder: number;
  isNew: boolean;
  isBestSeller: boolean;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  whatsappMessage: string;
  items: PackageItemRow[];
  contentImages: { imageUrl: string; altText: string | null }[];
};

export type TreatmentOption = {
  id: string;
  name: string;
  categoryName: string;
};

export const initialState: ActionState = { error: null };