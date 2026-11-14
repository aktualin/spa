import type { ActionState } from "../../actions/categories";

export type CategoryFormData = {
  id: string | null;
  name: string;
  slug: string;
  kind: "TREATMENT" | "ADDON";
  description: string;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  wasPublished: boolean;
  itemCount: number;
};

export const initialState: ActionState = { error: null };